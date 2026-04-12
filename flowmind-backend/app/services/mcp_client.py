"""
mcp_client.py — HTTP client for the MCP service layer.

HOW MCP INTEGRATION WORKS:
═══════════════════════════════════════════════════════════════════
When MCP_DEV_MOCK=true  (default) → returns intelligent mock data
When MCP_DEV_MOCK=false → makes real HTTP calls to MCP_LAYER_URL

TO CONNECT YOUR MCP SERVICE (when it's ready):
1.  Set MCP_LAYER_URL=http://localhost:9000 in .env
2.  Set MCP_DEV_MOCK=false in .env
3.  Make sure your MCP service exposes these endpoints:
    POST /mcp/generate     → DAG generation via Gemini
    POST /mcp/simulate     → Pre-execution risk analysis
    POST /mcp/risk-check   → Runtime risk per parallel group
    POST /mcp/execute/{service} → Execute a single service step

MCP REQUEST/RESPONSE CONTRACT:
─────────────────────────────────────────────────────────────────
POST /mcp/generate
  Request:  { description, services, userId }
  Response: { workflowId, dag: { nodes: [...], edges: [...] } }

POST /mcp/simulate
  Request:  { workflowId, dag }
  Response: { confidence, steps, parallelGroups, autoExecute }

POST /mcp/risk-check
  Request:  { completed_steps, next_group, workflow_id }
  Response: { riskResults: [...], blockedNodes: [...] }

POST /mcp/execute/{service}
  Request:  { nodeId, action, inputs, user_tokens }
  Response: { output, duration, status }
═══════════════════════════════════════════════════════════════════
"""

import httpx
import logging
import random
import networkx as nx
from typing import Any, Dict, List
from app.config import settings

logger = logging.getLogger(__name__)

SERVICE_COLORS = {
    "gmail":  {"action": "send_email",    "label": "Gmail: Send Email"},
    "github": {"action": "create_issue",  "label": "GitHub: Create Issue"},
    "notion": {"action": "listen_database", "label": "Notion: Watch Database"},
    "drive":  {"action": "upload_file",   "label": "Drive: Upload File"},
    "gemini": {"action": "summarize",     "label": "Gemini: Summarize"},
}


# ─── Real MCP calls ──────────────────────────────────────────────
async def _call_mcp(endpoint: str, payload: Dict) -> Dict:
    """Make a real HTTP call to the MCP service."""
    url = f"{settings.MCP_LAYER_URL}{endpoint}"
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(url, json=payload)
        
        if response.status_code >= 400:
            try:
                # Try to extract the friendly 'detail' message from FastAPI response
                error_json = response.json()
                error_detail = error_json.get("detail", f"Error {response.status_code}")
                raise Exception(error_detail)
            except (ValueError, KeyError, TypeError):
                # Fallback to standard status error if JSON parsing fails
                response.raise_for_status()
                
        return response.json()


# ─── Mock responses ──────────────────────────────────────────────
def _mock_generate_dag(description: str, services: List[str]) -> Dict:
    """Generates a realistic mock DAG based on requested services."""
    nodes = []
    edges = []

    # Always start with first service as trigger
    for i, service in enumerate(services):
        svc_info = SERVICE_COLORS.get(service, {"action": "process", "label": f"{service.title()}: Process"})
        nodes.append({
            "id": f"n{i + 1}",
            "service": service,
            "action": svc_info["action"],
            "label": svc_info["label"],
        })

    # Add Gemini summarizer in the middle if not already included
    if "gemini" not in services and len(services) > 1:
        nodes.insert(1, {
            "id": f"n_gemini",
            "service": "gemini",
            "action": "summarize",
            "label": "Gemini: AI Processing",
        })
        # Re-number
        for idx, node in enumerate(nodes):
            node["id"] = f"n{idx + 1}"

    # Build sequential edges
    for i in range(len(nodes) - 1):
        edges.append({"from": nodes[i]["id"], "to": nodes[i + 1]["id"]})

    # Add parallel branch if 3+ nodes
    if len(nodes) >= 3:
        edges.append({"from": nodes[1]["id"], "to": nodes[-1]["id"]})

    return {"nodes": nodes, "edges": edges}


async def _mock_simulate(dag: Dict) -> Dict:
    """Returns a realistic simulation result using the ML success prediction model."""
    nodes = dag.get("nodes", [])
    edges = dag.get("edges", [])
    
    # 1. Analyze DAG features for the ML model
    G = nx.DiGraph()
    for node in nodes:
        G.add_node(node["id"])
    for edge in edges:
        G.add_edge(edge["from"], edge["to"])
        
    num_services = len(nodes)
    dag_depth = nx.dag_longest_path_length(G) + 1 if num_services > 0 else 0
    generations = list(nx.topological_generations(G))
    parallel_steps = max(len(gen) for gen in generations) if generations else 0
    
    # 2. Call ML Service for prediction
    ml_prob = 0.90  # Fallback
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.post("http://localhost:9001/predict", json={
                "num_services": num_services,
                "dag_depth": dag_depth,
                "parallel_steps": parallel_steps,
                "retry_count": 0,
                "avg_latency": 1.8
            })
            if resp.status_code == 200:
                ml_prob = resp.json().get("probability", 0.90)
                logger.info(f"🧠 ML Prediction for DAG (n={num_services}, d={dag_depth}, p={parallel_steps}): {ml_prob}")
    except Exception as e:
        logger.warning(f"ML Service call failed, using fallback: {e}")

    # 3. Apply probability to nodes
    steps = []
    high_risk_nodes = []
    
    # ML model gives a global prob, we use it as the base for all nodes
    # (Converting 0.0-1.0 to 0-100 for the frontend)
    prob_int = int(ml_prob * 100)
    
    for node in nodes:
        risk = "LOW" if prob_int >= 90 else "MEDIUM" if prob_int >= 82 else "HIGH"
        hitl = risk == "HIGH"
        if hitl:
            high_risk_nodes.append(node["id"])
        steps.append({
            "nodeId": node["id"],
            "successProbability": prob_int,
            "risk": risk,
            "hitlRequired": hitl,
        })

    # Group last two nodes as parallel if possible
    parallel_groups = []
    if len(nodes) >= 3:
        parallel_groups = [[nodes[-2]["id"], nodes[-1]["id"]]]

    confidence = round(sum(s["successProbability"] for s in steps) / len(steps), 1) if steps else 0
    return {
        "confidence": confidence,
        "steps": steps,
        "parallelGroups": parallel_groups,
        "autoExecute": confidence >= 85 and not high_risk_nodes,
    }


def _mock_risk_check(completed_steps: List, next_group: List) -> Dict:
    """Simulates runtime risk evaluation for a parallel node group."""
    risk_results = []
    blocked_nodes = []

    for node in next_group:
        node_id = node.get("id", node) if isinstance(node, dict) else node
        # 10% chance of HIGH risk at runtime (simulates real conditions)
        escalated = random.random() < 0.10
        risk_level = "HIGH" if escalated else "LOW"
        reason = (
            "Upstream output size may exceed API limit" if escalated
            else "No change from pre-execution estimate"
        )
        risk_results.append({
            "nodeId": node_id,
            "riskLevel": risk_level,
            "reason": reason,
        })
        if escalated:
            blocked_nodes.append({"nodeId": node_id, "reason": reason})

    return {"riskResults": risk_results, "blockedNodes": blocked_nodes}


async def _mock_execute_node(service: str, action: str, node_id: str) -> Dict:
    """Simulates executing a single service node."""
    import asyncio
    # Simulate variable execution time
    await asyncio.sleep(random.uniform(0.3, 1.2))
    
    output = f"[MOCK] {service.title()} executed {action} successfully"
    if service == "notion" and action == "create_task":
        output = "[MOCK] Created Notion task: 'Summarized Repository Details' in Database 'FlowMind Tracker'"
    elif service == "notion" and action == "listen_database":
        output = "[MOCK] Detected 2 new tasks in Notion database: 'Fix UI Bug', 'Update Documentation'"
    
    return {
        "output": output,
        "status": "success",
        "duration": random.randint(300, 1400),
    }


# ─── Public API (auto-switches mock ↔ real) ──────────────────────
async def generate_dag(
    description: str,
    services: List[str],
    user_id: str,
    previous_dag: Dict | None = None,
    repair_context: Dict | None = None,
    previous_plan: str | None = None,
    refinement_prompt: str | None = None,
) -> Dict:
    """Generate a DAG from natural language. Uses mock if MCP is offline."""
    if settings.MCP_DEV_MOCK:
        logger.info("🔵 [MOCK] Generating DAG")
        dag = _mock_generate_dag(description, services)
        return {"dag": dag}

    try:
        return await _call_mcp("/mcp/generate", {
            "description": description,
            "services": services,
            "userId": user_id,
            "previousDag": previous_dag,
            "repairContext": repair_context,
            "previousPlan": previous_plan,
            "refinementPrompt": refinement_prompt,
        })
    except Exception as e:
        logger.exception("MCP generate failed while MCP_DEV_MOCK=false")
        raise


async def simulate_workflow(workflow_id: str, dag: Dict) -> Dict:
    """Pre-execution risk simulation."""
    if settings.MCP_DEV_MOCK:
        logger.info("🔵 [MOCK] Simulating workflow")
        return await _mock_simulate(dag)

    try:
        return await _call_mcp("/mcp/simulate", {"workflowId": workflow_id, "dag": dag})
    except Exception as e:
        logger.exception("MCP simulate failed while MCP_DEV_MOCK=false")
        raise


async def check_risk(completed_steps: List, next_group: List, workflow_id: str) -> Dict:
    """Runtime risk check before a parallel execution group fires."""
    if settings.MCP_DEV_MOCK:
        return _mock_risk_check(completed_steps, next_group)

    try:
        return await _call_mcp("/mcp/risk-check", {
            "completed_steps": completed_steps,
            "next_group": next_group,
            "workflow_id": workflow_id,
        })
    except Exception as e:
        logger.exception("MCP risk-check failed while MCP_DEV_MOCK=false")
        raise


async def execute_node(
    service: str,
    action: str,
    node_id: str,
    inputs: Dict = None,
    user_tokens: Dict = None,
) -> Dict:
    """Execute a single service node via MCP."""
    if settings.MCP_DEV_MOCK:
        return await _mock_execute_node(service, action, node_id)

    try:
        return await _call_mcp(f"/mcp/execute/{service}", {
            "nodeId": node_id,
            "action": action,
            "inputs": inputs or {},
            "user_tokens": user_tokens or {},
        })
    except Exception as e:
        logger.exception("MCP execute failed while MCP_DEV_MOCK=false")
        raise
