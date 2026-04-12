from pydantic import BaseModel
from typing import List, Optional, Any, Dict


# ── Generate ──────────────────────────────────────────────────
class GenerateWorkflowRequest(BaseModel):
    description: str
    services: List[str]  # ["gmail", "github", "notion"]


class DAGNodeSchema(BaseModel):
    id: str
    service: str
    action: str
    label: str
    inputs: Optional[Dict[str, Any]] = None


class DAGEdgeSchema(BaseModel):
    from_node: str
    to_node: str

    class Config:
        populate_by_name = True
        fields = {"from_node": {"alias": "from"}, "to_node": {"alias": "to"}}


class GenerateWorkflowResponse(BaseModel):
    workflowId: str
    dag: Dict[str, Any]
    planText: str


class RefineWorkflowRequest(BaseModel):
    workflowId: str
    refinementPrompt: str


class ConfigureWorkflowRequest(BaseModel):
    workflowId: str
    nodeInputs: Dict[str, Dict[str, Any]]


# ── Simulate ──────────────────────────────────────────────────
class SimulateRequest(BaseModel):
    workflowId: str


class SimulationStepSchema(BaseModel):
    nodeId: str
    successProbability: float
    risk: str
    hitlRequired: Optional[bool] = False


class SimulateResponse(BaseModel):
    confidence: float
    steps: List[SimulationStepSchema]
    parallelGroups: List[List[str]]
    autoExecute: bool


# ── Approve ───────────────────────────────────────────────────
class HITLDecisionSchema(BaseModel):
    nodeId: str
    approved: bool


class ApproveRequest(BaseModel):
    workflowId: str
    decisions: List[HITLDecisionSchema]


# ── Execute ───────────────────────────────────────────────────
class ExecuteRequest(BaseModel):
    workflowId: str


class ExecuteResponse(BaseModel):
    executionId: str
    status: str


# ── List/Get ──────────────────────────────────────────────────
class WorkflowSummary(BaseModel):
    id: str
    name: str
    description: str
    status: str
    lastRun: Optional[str] = None
    successRate: Optional[str] = None
    created_at: Optional[str] = None
