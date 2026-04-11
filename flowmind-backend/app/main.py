"""
main.py — FastAPI application entry point.
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.db.database import init_db
from app.utils.logger import setup_logger
from app.routes import auth, workflow, genome, integrations, ws

setup_logger()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup / shutdown lifecycle."""
    await init_db()
    yield
    # Cleanup (if needed) goes here


app = FastAPI(
    title="FlowMind API Gateway",
    description="Agentic MCP Gateway — Backend API",
    version="1.0.0",
    lifespan=lifespan,
)

# ─── CORS ────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:5173", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Routers ─────────────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(workflow.router)
app.include_router(genome.router)
app.include_router(integrations.router)
app.include_router(ws.router)


# ─── Health check ────────────────────────────────────────────────
@app.get("/health")
async def health():
    return {"status": "ok", "service": "FlowMind API Gateway", "version": "1.0.0"}
