"""
workflow.py - Workflow CRUD + generate/simulate/approve/execute routes.
"""
from datetime import datetime
from typing import Any, Dict, List

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException

from app.dependencies import get_current_user
from app.models.user import User
from app.models.workflow import Execution, ExecutionStatus, Workflow, WorkflowStatus
from app.schemas.workflow import (
    ApproveRequest,
    ConfigureWorkflowRequest,
    ExecuteRequest,
    ExecuteResponse,
    GenerateWorkflowRequest,
    GenerateWorkflowResponse,
    RefineWorkflowRequest,
    SimulateRequest,
)
from app.services import mcp_client
from app.services.execution_service import run_execution
from app.utils.ws_manager import manager

router = APIRouter(prefix="/api", tags=["workflow"])


def _execution_duration_ms(execution: Execution) -> int | None:
    if execution.completed_at:
        return max(int((execution.completed_at - execution.started_at).total_seconds() * 1000), 0)

    durations = [
        int(entry.get("duration", 0))
        for entry in (execution.log_json or [])
        if entry.get("duration") is not None
    ]
    return sum(durations) if durations else None


def _format_success_rate(successes: int, total_finished: int) -> str:
    if total_finished == 0:
        return "-"
    return f"{(successes / total_finished) * 100:.1f}%"


async def _build_workflow_metrics(user_id: str) -> Dict[str, Any]:
    workflows = await Workflow.find(Workflow.user_id == user_id).sort("-created_at").to_list()
    executions = await Execution.find(Execution.user_id == user_id).to_list()

    workflow_execution_map: Dict[str, List[Execution]] = {}
    for execution in executions:
        workflow_execution_map.setdefault(execution.workflow_id, []).append(execution)

    workflow_rows: List[Dict[str, Any]] = []
    total_finished = 0
    total_successes = 0
    duration_samples: List[int] = []

    for workflow in workflows:
        wf_executions = sorted(
            workflow_execution_map.get(str(workflow.id), []),
            key=lambda item: item.started_at,
            reverse=True,
        )
        finished_executions = [
            execution
            for execution in wf_executions
            if execution.status in {ExecutionStatus.DONE, ExecutionStatus.FAILED}
        ]
        success_count = sum(
            1 for execution in finished_executions if execution.status == ExecutionStatus.DONE
        )
        total_finished += len(finished_executions)
        total_successes += success_count

        workflow_durations = [
            duration
            for execution in finished_executions
            for duration in [_execution_duration_ms(execution)]
            if duration is not None
        ]
        duration_samples.extend(workflow_durations)

        latest_execution = wf_executions[0] if wf_executions else None
        last_run_at = (
            latest_execution.completed_at or latest_execution.started_at
            if latest_execution
            else (workflow.updated_at or workflow.created_at)
        )

        workflow_rows.append(
            {
                "id": str(workflow.id),
                "name": workflow.description[:40] + ("..." if len(workflow.description) > 40 else ""),
                "description": workflow.description,
                "status": workflow.status.value,
                "lastRun": last_run_at.isoformat() if last_run_at else None,
                "successRate": _format_success_rate(success_count, len(finished_executions)),
                "avgLatencyMs": round(sum(workflow_durations) / len(workflow_durations), 2)
                if workflow_durations
                else None,
                "created_at": workflow.created_at.isoformat(),
            }
        )

    avg_success_rate = round((total_successes / total_finished) * 100, 1) if total_finished else 0.0
    avg_latency_ms = round(sum(duration_samples) / len(duration_samples), 2) if duration_samples else 0.0

    return {
        "summary": {
            "totalWorkflows": len(workflows),
            "avgSuccessRate": avg_success_rate,
            "avgLatencyMs": avg_latency_ms,
            "totalExecutions": len(executions),
            "finishedExecutions": total_finished,
        },
        "workflows": workflow_rows,
    }


@router.post("/workflow/generate", response_model=GenerateWorkflowResponse)
async def generate_workflow(
    body: GenerateWorkflowRequest,
    current_user: User = Depends(get_current_user),
):
    result = await mcp_client.generate_dag(
        description=body.description,
        services=body.services,
        user_id=str(current_user.id),
    )
    dag = result.get("dag", {})

    workflow = Workflow(
        user_id=str(current_user.id),
        description=body.description,
        dag_json=dag,
        plan_text=result.get("planText", ""),
        plan_history=[
            {
                "type": "initial",
                "prompt": body.description,
                "planText": result.get("planText", ""),
                "dag": dag,
                "timestamp": datetime.utcnow().isoformat(),
            }
        ],
        status=WorkflowStatus.PENDING,
    )
    await workflow.insert()

    return GenerateWorkflowResponse(
        workflowId=str(workflow.id),
        dag=dag,
        planText=result.get("planText", ""),
    )


@router.post("/workflow/refine", response_model=GenerateWorkflowResponse)
async def refine_workflow(
    body: RefineWorkflowRequest,
    current_user: User = Depends(get_current_user),
):
    workflow = await Workflow.get(body.workflowId)
    if not workflow or workflow.user_id != str(current_user.id):
        raise HTTPException(status_code=404, detail="Workflow not found")
    if not workflow.dag_json:
        raise HTTPException(status_code=400, detail="No DAG generated yet")
    if not body.refinementPrompt.strip():
        raise HTTPException(status_code=400, detail="Refinement prompt is required")

    result = await mcp_client.generate_dag(
        description=workflow.description,
        services=[],
        user_id=str(current_user.id),
        previous_dag=workflow.dag_json,
        previous_plan=workflow.plan_text,
        refinement_prompt=body.refinementPrompt.strip(),
    )
    dag = result.get("dag", {})
    plan_text = result.get("planText", "")
    plan_history = list(workflow.plan_history or [])
    plan_history.append(
        {
            "type": "refinement",
            "prompt": body.refinementPrompt.strip(),
            "planText": plan_text,
            "dag": dag,
            "timestamp": datetime.utcnow().isoformat(),
        }
    )

    await workflow.set(
        {
            "dag_json": dag,
            "plan_text": plan_text,
            "plan_history": plan_history,
            "status": WorkflowStatus.PENDING,
            "updated_at": datetime.utcnow(),
        }
    )

    return GenerateWorkflowResponse(
        workflowId=str(workflow.id),
        dag=dag,
        planText=plan_text,
    )


@router.post("/workflow/simulate")
async def simulate_workflow(
    body: SimulateRequest,
    current_user: User = Depends(get_current_user),
):
    workflow = await Workflow.get(body.workflowId)
    if not workflow or workflow.user_id != str(current_user.id):
        raise HTTPException(status_code=404, detail="Workflow not found")

    simulation = await mcp_client.simulate_workflow(
        workflow_id=body.workflowId,
        dag=workflow.dag_json or {},
    )

    await workflow.set({"simulation": simulation, "updated_at": datetime.utcnow()})
    return simulation


@router.post("/workflow/configure")
async def configure_workflow(
    body: ConfigureWorkflowRequest,
    current_user: User = Depends(get_current_user),
):
    workflow = await Workflow.get(body.workflowId)
    if not workflow or workflow.user_id != str(current_user.id):
        raise HTTPException(status_code=404, detail="Workflow not found")

    dag = workflow.dag_json or {}
    nodes = dag.get("nodes", [])
    inputs_by_node = body.nodeInputs or {}

    for node in nodes:
        node_id = node.get("id")
        if node_id in inputs_by_node:
            existing_inputs = dict(node.get("inputs") or {})
            existing_inputs.update(inputs_by_node[node_id])
            node["inputs"] = existing_inputs

    dag["nodes"] = nodes
    await workflow.set({"dag_json": dag, "updated_at": datetime.utcnow()})
    return {"success": True, "workflowId": body.workflowId, "dag": dag}


@router.post("/workflow/approve")
async def approve_workflow(
    body: ApproveRequest,
    current_user: User = Depends(get_current_user),
):
    workflow = await Workflow.get(body.workflowId)
    if not workflow or workflow.user_id != str(current_user.id):
        raise HTTPException(status_code=404, detail="Workflow not found")

    decisions = [decision.dict() for decision in body.decisions]
    await workflow.set(
        {
            "hitl_decisions": decisions,
            "updated_at": datetime.utcnow(),
        }
    )
    return {"success": True, "decisions": decisions}


@router.post("/workflow/execute", response_model=ExecuteResponse)
async def execute_workflow(
    body: ExecuteRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
):
    workflow = await Workflow.get(body.workflowId)
    if not workflow or workflow.user_id != str(current_user.id):
        raise HTTPException(status_code=404, detail="Workflow not found")
    if not workflow.dag_json:
        raise HTTPException(status_code=400, detail="No DAG generated yet")

    execution = Execution(
        workflow_id=str(workflow.id),
        user_id=str(current_user.id),
        status=ExecutionStatus.RUNNING,
    )
    await execution.insert()
    await workflow.set({"status": WorkflowStatus.RUNNING, "updated_at": datetime.utcnow()})

    background_tasks.add_task(run_execution, workflow, execution, manager)

    return ExecuteResponse(executionId=str(execution.id), status="RUNNING")


@router.get("/workflows")
async def list_workflows(current_user: User = Depends(get_current_user)):
    metrics = await _build_workflow_metrics(str(current_user.id))
    return metrics["workflows"]


@router.get("/dashboard/summary")
async def dashboard_summary(current_user: User = Depends(get_current_user)):
    metrics = await _build_workflow_metrics(str(current_user.id))
    return metrics["summary"]


@router.get("/workflows/{workflow_id}")
async def get_workflow(
    workflow_id: str,
    current_user: User = Depends(get_current_user),
):
    workflow = await Workflow.get(workflow_id)
    if not workflow or workflow.user_id != str(current_user.id):
        raise HTTPException(status_code=404, detail="Workflow not found")
    return {
        "id": str(workflow.id),
        "description": workflow.description,
        "dag": workflow.dag_json,
        "planText": workflow.plan_text,
        "planHistory": workflow.plan_history,
        "status": workflow.status,
        "simulation": workflow.simulation,
        "hitl_decisions": workflow.hitl_decisions,
        "created_at": workflow.created_at.isoformat(),
    }


@router.delete("/workflows/{workflow_id}")
async def delete_workflow(
    workflow_id: str,
    current_user: User = Depends(get_current_user),
):
    workflow = await Workflow.get(workflow_id)
    if not workflow or workflow.user_id != str(current_user.id):
        raise HTTPException(status_code=404, detail="Workflow not found")
    await workflow.delete()
    return {"success": True}
