import json
from time import perf_counter

from app.adapters.base import ServiceAdapter
from app.models.schemas import ExecuteRequest, ExecuteResponse


async def execute_service_action(adapter: ServiceAdapter, body: ExecuteRequest) -> ExecuteResponse:
    started = perf_counter()
    result = await adapter.execute(body.action, body.inputs, body.user_tokens)
    duration = int((perf_counter() - started) * 1000)

    if isinstance(result, str):
        output = result
    else:
        output = json.dumps(result)

    return ExecuteResponse(output=output, duration=duration, status="success")
