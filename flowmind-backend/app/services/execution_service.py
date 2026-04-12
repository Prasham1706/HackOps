"""
execution_service.py - Async DAG executor with self-healing DAG regeneration.
"""
import asyncio
import logging
from datetime import datetime
from typing import Any, Dict, List

import networkx as nx

from app.models.integration import Integration
from app.models.workflow import Execution, ExecutionStatus, Workflow, WorkflowStatus
from app.services import mcp_client
from app.services.dag_service import build_dag, get_parallel_levels
from app.services.genome_service import create_genome
from app.utils.ws_manager import ConnectionManager

logger = logging.getLogger(__name__)

MAX_NODE_RETRIES = 2
MAX_DAG_REPAIRS = 1


async def run_execution(
    workflow: Workflow,
    execution: Execution,
    ws_manager: ConnectionManager,
) -> None:
    workflow_id = str(workflow.id)
    execution_id = str(execution.id)
    all_completed_steps: List[Dict[str, Any]] = []
    all_success = False
    repair_attempt = 0

    while repair_attempt <= MAX_DAG_REPAIRS:
        dag_data = workflow.dag_json or {}
        nodes = dag_data.get("nodes", [])
        edges = dag_data.get("edges", [])

        G = build_dag(nodes, edges)
        levels = get_parallel_levels(G)
        completed_steps: List[Dict[str, Any]] = []
        failure_context: Dict[str, Any] | None = None

        for level_nodes in levels:
            level_defs = [dict(G.nodes[n]) for n in level_nodes]

            if completed_steps:
                risk_data = await mcp_client.check_risk(completed_steps, level_defs, workflow_id)
                await ws_manager.emit(workflow_id, {
                    "type": "risk_updated",
                    "group": level_nodes,
                    "results": risk_data.get("riskResults", []),
                })

                blocked_ids = {
                    blocked["nodeId"] if isinstance(blocked, dict) else blocked
                    for blocked in risk_data.get("blockedNodes", [])
                }
                for node_id in blocked_ids:
                    reason = next(
                        (
                            result["reason"]
                            for result in risk_data.get("riskResults", [])
                            if result["nodeId"] == node_id
                        ),
                        "Risk escalated",
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

                level_nodes = [node_id for node_id in level_nodes if node_id not in blocked_ids]

            if not level_nodes:
                continue

            await ws_manager.emit(workflow_id, {
                "type": "parallel_cleared",
                "group": level_nodes,
            })

            results = await asyncio.gather(*[
                _execute_node(
                    node_id=node_id,
                    G=G,
                    workflow_id=workflow_id,
                    execution=execution,
                    ws_manager=ws_manager,
                    completed_steps=completed_steps,
                    all_completed_steps=all_completed_steps,
                    max_retries=MAX_NODE_RETRIES,
                )
                for node_id in level_nodes
            ])

            failure_context = next((result for result in results if not result.get("success")), None)
            if failure_context:
                break

        if not failure_context:
            all_success = True
            break

        if repair_attempt >= MAX_DAG_REPAIRS or not _should_attempt_repair(failure_context):
            break

        repaired = await _repair_workflow(
            workflow=workflow,
            execution=execution,
            ws_manager=ws_manager,
            failure_context=failure_context,
            completed_steps=completed_steps,
            repair_attempt=repair_attempt + 1,
        )
        if not repaired:
            break

        repair_attempt += 1

    final_status = ExecutionStatus.DONE if all_success else ExecutionStatus.FAILED
    await execution.set({
        "status": final_status,
        "completed_at": datetime.utcnow(),
    })
    await workflow.set({
        "status": WorkflowStatus.DONE if all_success else WorkflowStatus.FAILED,
        "updated_at": datetime.utcnow(),
    })

    genome_id = None
    if all_success:
        genome = await create_genome(workflow, execution)
        genome_id = str(genome.id)

    if all_success:
        await ws_manager.emit(workflow_id, {
            "type": "workflow_complete",
            "executionId": execution_id,
            "totalDuration": sum(step.get("duration", 0) for step in all_completed_steps),
            "genomeId": genome_id,
        })
    else:
        await ws_manager.emit(workflow_id, {
            "type": "workflow_failed",
            "executionId": execution_id,
            "totalDuration": sum(step.get("duration", 0) for step in all_completed_steps),
        })


async def _execute_node(
    node_id: str,
    G: nx.DiGraph,
    workflow_id: str,
    execution: Execution,
    ws_manager: ConnectionManager,
    completed_steps: List[Dict[str, Any]],
    all_completed_steps: List[Dict[str, Any]],
    max_retries: int,
) -> Dict[str, Any]:
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
                await ws_manager.emit(workflow_id, {
                    "type": "self_healing",
                    "nodeId": node_id,
                    "strategy": "retry_with_backoff",
                    "attempt": attempt,
                })
                await asyncio.sleep(2 ** attempt)

            user_tokens = await _load_user_tokens(execution.user_id, service)
            result = await mcp_client.execute_node(
                service,
                action,
                node_id,
                inputs=inputs,
                user_tokens=user_tokens,
            )
            duration = int((asyncio.get_event_loop().time() - t0) * 1000)

            await ws_manager.emit(workflow_id, {
                "type": "step_success",
                "nodeId": node_id,
                "output": result.get("output"),
                "duration": duration,
            })

            success_step = {
                "nodeId": node_id,
                "service": service,
                "output": result.get("output"),
                "duration": duration,
            }
            completed_steps.append(success_step)
            all_completed_steps.append(success_step)

            await execution.update({"$push": {"log_json": {
                "nodeId": node_id,
                "status": "success",
                "output": result.get("output"),
                "duration": duration,
                "timestamp": datetime.utcnow().isoformat(),
            }}})
            return {"success": True, "nodeId": node_id}

        except Exception as exc:
            logger.warning("Node %s attempt %s failed: %s", node_id, attempt, exc)
            if attempt == max_retries:
                await ws_manager.emit(workflow_id, {
                    "type": "step_failed",
                    "nodeId": node_id,
                    "error": str(exc),
                })
                await execution.update({"$push": {"log_json": {
                    "nodeId": node_id,
                    "status": "failed",
                    "error": str(exc),
                    "timestamp": datetime.utcnow().isoformat(),
                }}})
                return {
                    "success": False,
                    "nodeId": node_id,
                    "service": service,
                    "action": action,
                    "error": str(exc),
                    "inputs": inputs,
                }

    return {
        "success": False,
        "nodeId": node_id,
        "service": service,
        "action": action,
        "error": "Unknown execution failure",
        "inputs": inputs,
    }


def _should_attempt_repair(failure_context: Dict[str, Any]) -> bool:
    error = str(failure_context.get("error") or "").lower()
    non_repairable_markers = [
        "dns/network",
        "getaddrinfo failed",
        "connection failed",
        "connection refused",
        "timed out",
        "temporarily unavailable",
        "api key is not configured",
        "access token is not configured",
        "oauth client is not configured",
        "token refresh failed",
        "unauthorized",
        "forbidden",
        "invalid api key",
        "invalid token",
        "proxy",
        "socket",
    ]
    return not any(marker in error for marker in non_repairable_markers)


async def _repair_workflow(
    workflow: Workflow,
    execution: Execution,
    ws_manager: ConnectionManager,
    failure_context: Dict[str, Any],
    completed_steps: List[Dict[str, Any]],
    repair_attempt: int,
) -> bool:
    workflow_id = str(workflow.id)
    current_dag = workflow.dag_json or {}
    services = _services_from_dag(current_dag)
    repair_context = {
        "repairAttempt": repair_attempt,
        "failedNode": {
            "nodeId": failure_context.get("nodeId"),
            "service": failure_context.get("service"),
            "action": failure_context.get("action"),
            "inputs": failure_context.get("inputs") or {},
            "error": failure_context.get("error"),
        },
        "completedSteps": completed_steps,
        "goal": workflow.description,
    }

    await ws_manager.emit(workflow_id, {
        "type": "workflow_repairing",
        "failedNodeId": failure_context.get("nodeId"),
        "reason": failure_context.get("error"),
        "attempt": repair_attempt,
    })

    await execution.update({"$push": {"log_json": {
        "nodeId": failure_context.get("nodeId"),
        "status": "repairing",
        "error": failure_context.get("error"),
        "timestamp": datetime.utcnow().isoformat(),
    }}})

    try:
        generated = await mcp_client.generate_dag(
            description=workflow.description,
            services=services,
            user_id=workflow.user_id,
            previous_dag=current_dag,
            repair_context=repair_context,
        )
        new_dag = generated.get("dag", {})
        if not new_dag or not new_dag.get("nodes"):
            raise ValueError("MCP returned an empty repaired DAG")
        new_dag = _carry_forward_inputs(current_dag, new_dag)
    except Exception as exc:
        logger.exception("Workflow DAG repair failed")
        await ws_manager.emit(workflow_id, {
            "type": "workflow_repair_failed",
            "failedNodeId": failure_context.get("nodeId"),
            "reason": str(exc),
            "attempt": repair_attempt,
        })
        await execution.update({"$push": {"log_json": {
            "nodeId": failure_context.get("nodeId"),
            "status": "repair_failed",
            "error": str(exc),
            "timestamp": datetime.utcnow().isoformat(),
        }}})
        return False

    repair_history = list(workflow.repair_history or [])
    repair_history.append({
        "attempt": repair_attempt,
        "failedNodeId": failure_context.get("nodeId"),
        "error": failure_context.get("error"),
        "previousDag": current_dag,
        "repairedDag": new_dag,
        "timestamp": datetime.utcnow().isoformat(),
    })
    workflow.repair_history = repair_history
    workflow.dag_json = new_dag

    await workflow.set({
        "dag_json": new_dag,
        "repair_history": repair_history,
        "updated_at": datetime.utcnow(),
    })

    await ws_manager.emit(workflow_id, {
        "type": "workflow_replanned",
        "failedNodeId": failure_context.get("nodeId"),
        "reason": failure_context.get("error"),
        "attempt": repair_attempt,
        "dag": new_dag,
    })
    await execution.update({"$push": {"log_json": {
        "nodeId": failure_context.get("nodeId"),
        "status": "replanned",
        "error": failure_context.get("error"),
        "timestamp": datetime.utcnow().isoformat(),
    }}})
    return True


def _build_node_inputs(
    node_id: str,
    G: nx.DiGraph,
    completed_steps: List[Dict[str, Any]],
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
                lines = str(latest_output).splitlines()
                first_line = lines[0].strip() if lines else ""
                inputs["title"] = first_line[:100] or "FlowMind Automation Task"
                if not inputs.get("content") and len(lines) > 1:
                    inputs["content"] = "\n".join(lines[1:]).strip()

    return inputs


def _services_from_dag(dag: Dict[str, Any]) -> List[str]:
    services: List[str] = []
    seen = set()
    for node in dag.get("nodes", []):
        service = str(node.get("service", "")).strip().lower()
        if service and service not in seen:
            seen.add(service)
            services.append(service)
    return services


def _carry_forward_inputs(old_dag: Dict[str, Any], new_dag: Dict[str, Any]) -> Dict[str, Any]:
    old_nodes = old_dag.get("nodes", [])
    old_by_id = {node.get("id"): node for node in old_nodes}
    old_by_signature: Dict[tuple[str, str], List[Dict[str, Any]]] = {}
    for node in old_nodes:
        signature = (str(node.get("service", "")), str(node.get("action", "")))
        old_by_signature.setdefault(signature, []).append(node)

    updated_nodes: List[Dict[str, Any]] = []
    for node in new_dag.get("nodes", []):
        merged_inputs = dict(node.get("inputs") or {})
        source = old_by_id.get(node.get("id"))
        if not source:
            signature = (str(node.get("service", "")), str(node.get("action", "")))
            matches = old_by_signature.get(signature, [])
            source = matches[0] if matches else None
        if source and source.get("inputs"):
            merged_inputs = {**dict(source.get("inputs") or {}), **merged_inputs}

        new_node = dict(node)
        if merged_inputs:
            new_node["inputs"] = merged_inputs
        updated_nodes.append(new_node)

    repaired_dag = dict(new_dag)
    repaired_dag["nodes"] = updated_nodes
    return repaired_dag


async def _load_user_tokens(user_id: str, service: str) -> Dict[str, Dict[str, str]]:
    integration = await Integration.find_one(
        Integration.user_id == user_id,
        Integration.service == service,
        Integration.status == "connected",
    )
    if not integration:
        return {}

    return {
        service: {
            "access_token": integration.access_token or "",
            "refresh_token": integration.refresh_token or "",
        }
    }
