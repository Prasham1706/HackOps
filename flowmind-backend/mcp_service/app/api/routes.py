from fastapi import FastAPI, HTTPException, Path

from app.adapters.registry import get_adapter
from app.core.exceptions import AdapterExecutionError, ConfigurationError
from app.models.schemas import (
    ExecuteRequest,
    ExecuteResponse,
    GenerateRequest,
    GenerateResponse,
    RiskCheckRequest,
    RiskCheckResponse,
    SimulateRequest,
    SimulateResponse,
)
from app.services.dag_generator import generate_workflow_dag
from app.services.executor import execute_service_action
from app.services.risk_engine import evaluate_runtime_risk
from app.services.simulation import simulate_workflow

app = FastAPI(title="FlowMind MCP Service", version="1.0.0")


@app.post("/mcp/generate", response_model=GenerateResponse)
async def generate_endpoint(body: GenerateRequest) -> GenerateResponse:
    return await generate_workflow_dag(body)


@app.post("/mcp/simulate", response_model=SimulateResponse)
async def simulate_endpoint(body: SimulateRequest) -> SimulateResponse:
    return simulate_workflow(body)


@app.post("/mcp/risk-check", response_model=RiskCheckResponse)
async def risk_check_endpoint(body: RiskCheckRequest) -> RiskCheckResponse:
    return evaluate_runtime_risk(body)


@app.post("/mcp/execute/{service}", response_model=ExecuteResponse)
async def execute_endpoint(
    body: ExecuteRequest,
    service: str = Path(..., description="Service name, e.g. gemini/github/gmail/notion"),
) -> ExecuteResponse:
    try:
        adapter = get_adapter(service)
        return await execute_service_action(adapter, body)
    except (AdapterExecutionError, ConfigurationError) as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.message) from exc
    except KeyError as exc:
        raise HTTPException(status_code=404, detail=f"Unsupported service '{service}'") from exc

