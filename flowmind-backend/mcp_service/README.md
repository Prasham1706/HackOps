# FlowMind MCP Service

This service implements the four MCP endpoints required by the FlowMind gateway:

- `POST /mcp/generate`
- `POST /mcp/simulate`
- `POST /mcp/risk-check`
- `POST /mcp/execute/{service}`

## Structure

Each executable service adapter lives in its own folder:

- `app/adapters/gemini`
- `app/adapters/github`
- `app/adapters/gmail`
- `app/adapters/notion`

Shared orchestration logic lives in:

- `app/services/dag_generator.py`
- `app/services/simulation.py`
- `app/services/risk_engine.py`
- `app/services/executor.py`

## Run

```bash
cd flowmind-backend/mcp_service
pip install -r requirements.txt
uvicorn main:app --reload --port 9000
```

## Environment

Copy `.env.example` to `.env` and fill in the tokens you need. The service can still generate DAGs without credentials by using a local heuristic planner, but execute endpoints for GitHub, Gmail, and Notion require valid credentials.

For end-to-end execution of generated workflows, these optional defaults are very helpful:

- `GITHUB_DEFAULT_REPO`
- `NOTION_DEFAULT_DATABASE_ID`

## Integration With Gateway

When you're ready to connect the backend:

```env
MCP_LAYER_URL=http://localhost:9000
MCP_DEV_MOCK=false
```

One important note for the next integration step: this MCP service returns `blockedNodes` as an array of node ID strings, matching your April 2026 contract. The current backend runtime executor expects objects there, so `flowmind-backend/app/services/execution_service.py` will need a tiny compatibility update during integration.
