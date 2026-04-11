from typing import Any, Dict, List, Literal, Optional
from uuid import uuid4

from pydantic import BaseModel, ConfigDict, Field, field_validator


class DAGNode(BaseModel):
    id: str
    service: str
    action: str
    label: str
    inputs: Dict[str, Any] = Field(default_factory=dict)


class DAGEdge(BaseModel):
    from_node: str = Field(alias="from")
    to_node: str = Field(alias="to")

    model_config = ConfigDict(populate_by_name=True, serialize_by_alias=True)


class DAGPayload(BaseModel):
    nodes: List[DAGNode]
    edges: List[DAGEdge]


class GenerateRequest(BaseModel):
    description: str
    services: List[str] = Field(default_factory=list)
    userId: str


class GenerateResponse(BaseModel):
    workflowId: str = Field(default_factory=lambda: f"wf-{uuid4()}")
    dag: DAGPayload


class SimulateRequest(BaseModel):
    workflowId: str
    dag: DAGPayload


class SimulationStep(BaseModel):
    nodeId: str
    successProbability: float
    risk: Literal["LOW", "MEDIUM", "HIGH"]
    hitlRequired: bool


class SimulateResponse(BaseModel):
    confidence: float
    steps: List[SimulationStep]
    parallelGroups: List[List[str]]
    autoExecute: bool


class CompletedStep(BaseModel):
    nodeId: str
    service: str
    output: Any
    duration: int


class NextGroupNode(BaseModel):
    id: str
    service: str
    action: str


class RiskCheckRequest(BaseModel):
    completed_steps: List[CompletedStep] = Field(default_factory=list)
    next_group: List[NextGroupNode] = Field(default_factory=list)
    workflow_id: str


class RiskResult(BaseModel):
    nodeId: str
    riskLevel: Literal["LOW", "MEDIUM", "HIGH"]
    reason: str


class RiskCheckResponse(BaseModel):
    riskResults: List[RiskResult]
    blockedNodes: List[str]


class ExecuteRequest(BaseModel):
    nodeId: str
    action: str
    inputs: Dict[str, Any] = Field(default_factory=dict)
    user_tokens: Optional[Dict[str, Dict[str, Any]]] = None


class ExecuteResponse(BaseModel):
    output: str
    duration: int
    status: Literal["success"]

    @field_validator("duration")
    @classmethod
    def validate_duration(cls, value: int) -> int:
        return max(0, value)
