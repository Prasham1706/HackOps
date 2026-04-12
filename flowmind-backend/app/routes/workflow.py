"""
workflow.py — Workflow CRUD + generate/simulate/approve/execute routes.
"""
import asyncio
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks

from app.dependencies import get_current_user
from app.models.user import User
from app.models.workflow import Execution, ExecutionStatus, Workflow, WorkflowStatus
from app.schemas.workflow import (
    ApproveRequest,
    ConfigureWorkflowRequest,
    ExecuteRequest,
    ExecuteResponse,
    RefineWorkflowRequest,
    GenerateWorkflowRequest,
    GenerateWorkflowResponse,
    SimulateRequest,
    SimulateResponse,
)
from app.services import mcp_client
from app.services.execution_service import run_execution
from app.utils.ws_manager import manager

router = APIRouter(prefix="/api", tags=["workflow"])


# ─── Generate ────────────────────────────────────────────────────
@router.post("/workflow/generate", response_model=GenerateWorkflowResponse)
async def generate_workflow(
    body: GenerateWorkflowRequest,
    current_user: User = Depends(get_current_user),
):
    """Call MCP to generate a DAG from natural language, persist to MongoDB."""
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
        plan_history=[{
            "type": "initial",
            "prompt": body.description,
            "planText": result.get("planText", ""),
            "dag": dag,
            "timestamp": datetime.utcnow().isoformat(),
        }],
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
    plan_history.append({
        "type": "refinement",
        "prompt": body.refinementPrompt.strip(),
        "planText": plan_text,
        "dag": dag,
        "timestamp": datetime.utcnow().isoformat(),
    })

    await workflow.set({
        "dag_json": dag,
        "plan_text": plan_text,
        "plan_history": plan_history,
        "status": WorkflowStatus.PENDING,
        "updated_at": datetime.utcnow(),
    })

    return GenerateWorkflowResponse(
        workflowId=str(workflow.id),
        dag=dag,
        planText=plan_text,
    )


# ─── Simulate ────────────────────────────────────────────────────
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


# ─── Approve (HITL) ──────────────────────────────────────────────
@router.post("/workflow/approve")
async def approve_workflow(
    body: ApproveRequest,
    current_user: User = Depends(get_current_user),
):
    workflow = await Workflow.get(body.workflowId)
    if not workflow or workflow.user_id != str(current_user.id):
        raise HTTPException(status_code=404, detail="Workflow not found")

    decisions = [d.dict() for d in body.decisions]
    await workflow.set({
        "hitl_decisions": decisions,
        "updated_at": datetime.utcnow(),
    })
    return {"success": True, "decisions": decisions}


# ─── Execute ─────────────────────────────────────────────────────
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

    # Create execution record
    execution = Execution(
        workflow_id=str(workflow.id),
        user_id=str(current_user.id),
        status=ExecutionStatus.RUNNING,
    )
    await execution.insert()
    await workflow.set({"status": WorkflowStatus.RUNNING, "updated_at": datetime.utcnow()})

    # Run DAG in background (non-blocking)
    background_tasks.add_task(run_execution, workflow, execution, manager)

    return ExecuteResponse(executionId=str(execution.id), status="RUNNING")


# ─── List Workflows ───────────────────────────────────────────────
@router.get("/workflows")
async def list_workflows(current_user: User = Depends(get_current_user)):
    workflows = await Workflow.find(Workflow.user_id == str(current_user.id)).sort("-created_at").to_list()
    return [
        {
            "id": str(wf.id),
            "name": wf.description[:40] + ("..." if len(wf.description) > 40 else ""),
            "description": wf.description,
            "status": wf.status.value,
            "lastRun": wf.updated_at.isoformat() if wf.updated_at else None,
            "successRate": "—",
            "created_at": wf.created_at.isoformat(),
        }
        for wf in workflows
    ]


# ─── Get Single Workflow ──────────────────────────────────────────
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


# ─── Delete Workflow ──────────────────────────────────────────────
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
