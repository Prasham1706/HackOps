"""
execution_service.py — Async DAG executor.

Flow:
  1. For each topological level (parallel group):
     a. Runtime risk check via MCP (or mock)
     b. Emit risk_updated and parallel_cleared events
     c. Fire all non-blocked nodes simultaneously via asyncio.gather
  2. Each node calls MCP execute endpoint
  3. Self-healing: retry up to 2 times with backoff on failure
  4. After all nodes complete: save execution log, create genome
"""
import asyncio
import logging
from datetime import datetime
from typing import Any, Dict, List

import networkx as nx

from app.models.workflow import Execution, ExecutionStatus, Workflow, WorkflowStatus
from app.services import mcp_client
from app.services.dag_service import build_dag, get_parallel_levels
from app.services.genome_service import create_genome
from app.utils.ws_manager import ConnectionManager

logger = logging.getLogger(__name__)


async def run_execution(
    workflow: Workflow,
    execution: Execution,
    ws_manager: ConnectionManager,
) -> None:
    """
    Main DAG execution coroutine. This runs in the background
    (triggered by POST /api/workflow/execute).
    """
    workflow_id = str(workflow.id)
    execution_id = str(execution.id)

    dag_data = workflow.dag_json or {}
    nodes = dag_data.get("nodes", [])
    edges = dag_data.get("edges", [])

    G = build_dag(nodes, edges)
    levels = get_parallel_levels(G)
    completed_steps: List[Dict] = []
    all_success = True

    for level_nodes in levels:
        level_defs = [dict(G.nodes[n]) for n in level_nodes]

        # ── Runtime Risk Check (skip for level 0) ──────────────────
        if completed_steps:
            risk_data = await mcp_client.check_risk(completed_steps, level_defs, workflow_id)

            await ws_manager.emit(workflow_id, {
                "type": "risk_updated",
                "group": level_nodes,
                "results": risk_data.get("riskResults", []),
            })

            blocked_ids = {
                b["nodeId"] if isinstance(b, dict) else b
                for b in risk_data.get("blockedNodes", [])
            }
            for node_id in blocked_ids:
                reason = next(
                    (r["reason"] for r in risk_data.get("riskResults", []) if r["nodeId"] == node_id),
                    "Risk escalated"
                )
                await ws_manager.emit(workflow_id, {
                    "type": "runtime_block",
                    "nodeId": node_id,
                    "reason": reason,
                    "action": "block_for_approval",
                })
                await execution.update({"$push": {"log_json": {
                    "nodeId": node_id,
                    "status": "blocked",
                    "reason": reason,
                    "timestamp": datetime.utcnow().isoformat(),
                }}})

            level_nodes = [n for n in level_nodes if n not in blocked_ids]

        if not level_nodes:
            continue

        # ── Parallel Cleared event ──────────────────────────────────
        await ws_manager.emit(workflow_id, {
            "type": "parallel_cleared",
            "group": level_nodes,
        })

        # ── Fire all nodes simultaneously ───────────────────────────
        tasks = [
            _execute_node(
                node_id=nid,
                G=G,
                workflow_id=workflow_id,
                execution=execution,
                ws_manager=ws_manager,
                completed_steps=completed_steps,
            )
            for nid in level_nodes
        ]
        results = await asyncio.gather(*tasks, return_exceptions=True)

        # Check if any node permanently failed
        for r in results:
            if isinstance(r, Exception) or r is False:
                all_success = False

    # ── Finalize execution ──────────────────────────────────────────
    final_status = ExecutionStatus.DONE if all_success else ExecutionStatus.FAILED
    await execution.set({
        "status": final_status,
        "completed_at": datetime.utcnow(),
    })
    await workflow.set({"status": WorkflowStatus.DONE if all_success else WorkflowStatus.FAILED})

    # ── Create Genome on success ────────────────────────────────────
    genome_id = None
    if all_success:
        genome = await create_genome(workflow, execution)
        genome_id = str(genome.id)

    await ws_manager.emit(workflow_id, {
        "type": "workflow_complete",
        "executionId": execution_id,
        "totalDuration": sum(
            s.get("duration", 0) for s in completed_steps
        ),
        "genomeId": genome_id,
    })


async def _execute_node(
    node_id: str,
    G: nx.DiGraph,
    workflow_id: str,
    execution: Execution,
    ws_manager: ConnectionManager,
    completed_steps: List[Dict],
    max_retries: int = 2,
) -> bool:
    """Execute a single DAG node with self-healing retry logic."""
    node = dict(G.nodes[node_id])
    service = node.get("service", "unknown")
    action = node.get("action", "process")
    inputs = _build_node_inputs(node_id, G, completed_steps)

    await ws_manager.emit(workflow_id, {
        "type": "step_started",
        "nodeId": node_id,
        "timestamp": datetime.utcnow().isoformat(),
    })

    t0 = asyncio.get_event_loop().time()

    for attempt in range(max_retries + 1):
        try:
            if attempt > 0:
                # Self-healing: exponential backoff
                await ws_manager.emit(workflow_id, {
                    "type": "self_healing",
                    "nodeId": node_id,
                    "strategy": "retry_with_backoff",
                    "attempt": attempt,
                })
                await asyncio.sleep(2 ** attempt)  # 2s, 4s

            result = await mcp_client.execute_node(service, action, node_id, inputs=inputs)
            duration = int((asyncio.get_event_loop().time() - t0) * 1000)

            await ws_manager.emit(workflow_id, {
                "type": "step_success",
                "nodeId": node_id,
                "output": result.get("output"),
                "duration": duration,
            })

            # Append to completed_steps for next level's risk check
            completed_steps.append({
                "nodeId": node_id,
                "service": service,
                "output": result.get("output"),
                "duration": duration,
            })

            # Persist log entry
            await execution.update({"$push": {"log_json": {
                "nodeId": node_id,
                "status": "success",
                "duration": duration,
                "timestamp": datetime.utcnow().isoformat(),
            }}})
            return True

        except Exception as e:
            logger.warning(f"Node {node_id} attempt {attempt} failed: {e}")
            if attempt == max_retries:
                await ws_manager.emit(workflow_id, {
                    "type": "step_failed",
                    "nodeId": node_id,
                    "error": str(e),
                })
                await execution.update({"$push": {"log_json": {
                    "nodeId": node_id,
                    "status": "failed",
                    "error": str(e),
                    "timestamp": datetime.utcnow().isoformat(),
                }}})
                return False

    return False


def _build_node_inputs(
    node_id: str,
    G: nx.DiGraph,
    completed_steps: List[Dict],
) -> Dict[str, Any]:
    node = dict(G.nodes[node_id])
    inputs = dict(node.get("inputs") or {})
    completed_by_id = {step["nodeId"]: step for step in completed_steps}
    predecessor_outputs = [
        completed_by_id[pred]["output"]
        for pred in G.predecessors(node_id)
        if pred in completed_by_id
    ]

    if predecessor_outputs:
        latest_output = predecessor_outputs[-1]
        inputs.setdefault("text", latest_output)
        inputs.setdefault("content", latest_output)
        inputs.setdefault("previous_output", latest_output)
        inputs.setdefault("upstream_outputs", predecessor_outputs)

        if node.get("service") == "notion" and node.get("action") == "create_task":
            if "title" not in inputs:
                first_line = str(latest_output).splitlines()[0].strip()
                inputs["title"] = first_line[:80] or "FlowMind Task"

    return inputs
