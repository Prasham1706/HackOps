from beanie import Document
from pydantic import BaseModel
from typing import Optional, List, Any, Dict
from datetime import datetime
from enum import Enum


class WorkflowStatus(str, Enum):
    PENDING = "PENDING"
    RUNNING = "RUNNING"
    DONE = "DONE"
    FAILED = "FAILED"


class DAGNode(BaseModel):
    id: str
    service: str
    action: str
    label: str
    inputs: Optional[Dict[str, Any]] = None


class DAGEdge(BaseModel):
    from_node: str  # "from" is a Python keyword
    to_node: str


class DAGJson(BaseModel):
    nodes: List[DAGNode] = []
    edges: List[DAGEdge] = []


class SimulationStep(BaseModel):
    nodeId: str
    successProbability: float
    risk: str  # LOW / MEDIUM / HIGH / CRITICAL
    hitlRequired: Optional[bool] = False


class SimulationResult(BaseModel):
    confidence: float
    steps: List[SimulationStep] = []
    parallelGroups: List[List[str]] = []
    autoExecute: bool = False


class HITLDecision(BaseModel):
    nodeId: str
    approved: bool


class Workflow(Document):
    user_id: str
    description: str
    dag_json: Optional[Dict[str, Any]] = None
    plan_text: Optional[str] = None
    plan_history: List[Dict[str, Any]] = []
    status: WorkflowStatus = WorkflowStatus.PENDING
    simulation: Optional[Dict[str, Any]] = None
    hitl_decisions: List[Dict[str, Any]] = []
    repair_history: List[Dict[str, Any]] = []
    created_at: datetime = datetime.utcnow()
    updated_at: datetime = datetime.utcnow()

    class Settings:
        name = "workflows"
        indexes = ["user_id", "created_at"]


class ExecutionLogEntry(BaseModel):
    nodeId: str
    status: str
    duration: Optional[int] = None
    output: Optional[Any] = None
    error: Optional[str] = None
    timestamp: datetime = datetime.utcnow()


class ExecutionStatus(str, Enum):
    RUNNING = "RUNNING"
    DONE = "DONE"
    FAILED = "FAILED"


class Execution(Document):
    workflow_id: str
    user_id: str
    status: ExecutionStatus = ExecutionStatus.RUNNING
    started_at: datetime = datetime.utcnow()
    completed_at: Optional[datetime] = None
    log_json: List[Dict[str, Any]] = []

    class Settings:
        name = "executions"
        indexes = ["workflow_id", "user_id"]
