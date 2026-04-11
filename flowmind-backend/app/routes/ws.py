"""
ws.py — WebSocket endpoint for real-time execution events.
Frontend connects to: ws://localhost:8000/ws/workflow/{workflow_id}
"""
import logging
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.utils.ws_manager import manager

router = APIRouter(tags=["websocket"])
logger = logging.getLogger(__name__)


@router.websocket("/ws/workflow/{workflow_id}")
async def workflow_websocket(workflow_id: str, websocket: WebSocket):
    """
    WebSocket endpoint.
    
    The frontend connects here after calling POST /api/workflow/execute.
    Events emitted by the backend (via ws_manager.emit()):
      - step_started      → node turns pulsing blue
      - step_success      → node turns green
      - step_failed       → node shakes red
      - self_healing      → neural scan overlay on node
      - risk_updated      → risk badges re-rendered on pending nodes
      - runtime_block     → node locked + HITL queue
      - parallel_cleared  → group cleared to run
      - workflow_complete → supernova burst + genome badge
    """
    await manager.connect(workflow_id, websocket)
    logger.info(f"WebSocket connected for workflow: {workflow_id}")

    try:
        # Keep the connection alive — execution events are PUSHED from the backend
        # Frontend can also send messages (e.g., HITL approval confirmations)
        while True:
            data = await websocket.receive_text()
            logger.debug(f"WS received from client [{workflow_id}]: {data}")
            # Future: handle frontend → backend WS messages here
    except WebSocketDisconnect:
        manager.disconnect(workflow_id, websocket)
        logger.info(f"WebSocket disconnected for workflow: {workflow_id}")
