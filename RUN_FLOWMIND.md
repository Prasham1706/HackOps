# FlowMind Run Guide

This guide starts the whole FlowMind app locally:

- Frontend on `http://localhost:5173`
- FastAPI backend gateway on `http://localhost:8000`
- MCP service on `http://localhost:9000`

## 1. Prerequisites

- Python `3.14.4`
- Node.js and npm
- MongoDB running locally or a working MongoDB Atlas URL

## 2. Project Layout

- Frontend: `C:\Users\Prasham\OneDrive\Documents\FlowMind\FlowMind\FlowMind`
- Backend: `C:\Users\Prasham\OneDrive\Documents\FlowMind\flowmind-backend`
- MCP service: `C:\Users\Prasham\OneDrive\Documents\FlowMind\flowmind-backend\mcp_service`

## 3. Backend Environment

Backend file:

- `C:\Users\Prasham\OneDrive\Documents\FlowMind\flowmind-backend\.env`

Required MCP connection values:

```env
MCP_LAYER_URL=http://localhost:9000
MCP_DEV_MOCK=false
```

## 4. MCP Service Environment

Create this file if it does not exist:

- `C:\Users\Prasham\OneDrive\Documents\FlowMind\flowmind-backend\mcp_service\.env`

You can copy from:

- `C:\Users\Prasham\OneDrive\Documents\FlowMind\flowmind-backend\mcp_service\.env.example`

Minimum example:

```env
GEMINI_API_KEY=your_gemini_key
GEMINI_MODEL=gemini-1.5-flash
GITHUB_TOKEN=your_github_token
GMAIL_ACCESS_TOKEN=your_google_access_token
NOTION_API_KEY=your_notion_key
MCP_REQUEST_TIMEOUT=30
MCP_MAX_GEMINI_INPUT_CHARS=15000
```

Notes:

- `POST /mcp/generate` works even without a Gemini key by falling back to heuristic DAG generation.
- Real `github`, `gmail`, and `notion` execution requires valid tokens.

## 5. Frontend Environment

Frontend file:

- `C:\Users\Prasham\OneDrive\Documents\FlowMind\FlowMind\FlowMind\.env`

Expected values:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

## 6. Install Dependencies

### Backend

```powershell
cd C:\Users\Prasham\OneDrive\Documents\FlowMind\flowmind-backend
python -m pip install -r requirements.txt
```

### MCP service

```powershell
cd C:\Users\Prasham\OneDrive\Documents\FlowMind\flowmind-backend\mcp_service
python -m pip install -r requirements.txt
```

### Frontend

```powershell
cd C:\Users\Prasham\OneDrive\Documents\FlowMind\FlowMind\FlowMind
npm install
```

## 7. Run The App

Open 3 terminals.

### Terminal 1: MCP service

```powershell
cd C:\Users\Prasham\OneDrive\Documents\FlowMind\flowmind-backend\mcp_service
python -m uvicorn main:app --reload --port 9000
```

Health check examples:

```powershell
Invoke-WebRequest http://localhost:9000/docs
Invoke-WebRequest http://localhost:9000/openapi.json
```

### Terminal 2: Backend gateway

```powershell
cd C:\Users\Prasham\OneDrive\Documents\FlowMind\flowmind-backend
python -m uvicorn app.main:app --reload --port 8000
```

Backend docs:

```powershell
Invoke-WebRequest http://localhost:8000/docs
```

### Terminal 3: Frontend

```powershell
cd C:\Users\Prasham\OneDrive\Documents\FlowMind\FlowMind\FlowMind
npm run dev
```

Open:

- `http://localhost:5173`

## 8. Quick End-To-End Test

1. Open the frontend.
2. Log in.
3. Go to Workflow Builder.
4. Use a prompt like:

```text
When a new GitHub issue is created, summarize it with Gemini and add it as a Notion task
```

5. Select `github`, `gemini`, and `notion`.
6. Click `Generate Workflow`.
7. Confirm the DAG appears in the canvas.
8. Click `Run Sim`.
9. If needed, click `Execute`.

## 9. What Was Integrated

- The MCP service is now implemented in:
  `C:\Users\Prasham\OneDrive\Documents\FlowMind\flowmind-backend\mcp_service`
- Backend mock mode was disabled in:
  `C:\Users\Prasham\OneDrive\Documents\FlowMind\flowmind-backend\.env`
- Backend runtime risk handling was updated to accept MCP `blockedNodes` as either:
  `["n2"]`
  or
  `[{"nodeId":"n2"}]`

## 10. Known Notes

- Your shell may still resolve `python` to the Microsoft Store shim. If that happens, use your real Python path explicitly:

```powershell
& "C:\Users\Prasham\AppData\Local\Programs\Python\Python314\python.exe" -m uvicorn main:app --reload --port 9000
```

- Gmail execution currently expects a valid OAuth access token in `GMAIL_ACCESS_TOKEN` or `user_tokens.gmail.access_token`.
- GitHub execution expects `GITHUB_TOKEN` or `user_tokens.github.access_token`.
- Notion execution expects `NOTION_API_KEY` or `user_tokens.notion.access_token`.

## 11. Verified Locally

The MCP service was smoke-tested in-process for:

- `POST /mcp/generate`
- `POST /mcp/simulate`
- `POST /mcp/risk-check`
- `POST /mcp/execute/gemini`

It also correctly returned `503` for `POST /mcp/execute/github` when no GitHub token was configured, which is the expected gateway retry/failure behavior.
