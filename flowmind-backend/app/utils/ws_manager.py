"""
ws_manager.py — WebSocket connection manager.
Tracks active connections per workflow_id.
Supports multiple frontend clients watching the same workflow.
"""
import json
import logging
from collections import defaultdict
from typing import Dict, List
from fastapi import WebSocket

logger = logging.getLogger(__name__)


class ConnectionManager:
    def __init__(self):
        # Maps workflow_id → list of active WebSocket connections
        self.active: Dict[str, List[WebSocket]] = defaultdict(list)

    async def connect(self, workflow_id: str, websocket: WebSocket):
        await websocket.accept()
        self.active[workflow_id].append(websocket)
        logger.info(f"WS connected: workflow={workflow_id}, total={len(self.active[workflow_id])}")

    def disconnect(self, workflow_id: str, websocket: WebSocket):
        if websocket in self.active[workflow_id]:
            self.active[workflow_id].remove(websocket)
        logger.info(f"WS disconnected: workflow={workflow_id}")

    async def emit(self, workflow_id: str, data: dict):
        """Send a JSON event to all clients watching this workflow."""
        message = json.dumps(data)
        dead = []
        for ws in self.active.get(workflow_id, []):
            try:
                await ws.send_text(message)
            except Exception as e:
                logger.warning(f"WS send failed: {e}")
                dead.append(ws)
        for ws in dead:
            self.disconnect(workflow_id, ws)

    async def send_to(self, websocket: WebSocket, data: dict):
        """Send directly to a single WebSocket connection."""
        await websocket.send_text(json.dumps(data))


# Singleton instance (shared across all routes)
manager = ConnectionManager()
