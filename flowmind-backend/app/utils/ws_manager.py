"""
ws_manager.py — WebSocket connection manager.
Tracks active connections per workflow_id.
Supports multiple frontend clients watching the same workflow.

Key feature: event buffering.
  If the execution background task emits events BEFORE the frontend
  WebSocket connects, those events are buffered (up to BUFFER_MAX per workflow).
  When the client connects, buffered events are flushed immediately.
"""
import json
import logging
from collections import defaultdict
from typing import Dict, List
from fastapi import WebSocket

logger = logging.getLogger(__name__)

BUFFER_MAX = 100  # max events to buffer per workflow


class ConnectionManager:
    def __init__(self):
        # Maps workflow_id → list of active WebSocket connections
        self.active: Dict[str, List[WebSocket]] = defaultdict(list)
        # Maps workflow_id → list of buffered events (emitted before connect)
        self._buffer: Dict[str, List[dict]] = defaultdict(list)

    async def connect(self, workflow_id: str, websocket: WebSocket):
        await websocket.accept()
        self.active[workflow_id].append(websocket)
        logger.info(f"WS connected: workflow={workflow_id}, total={len(self.active[workflow_id])}")

        # Flush buffered events immediately
        buffered = self._buffer.pop(workflow_id, [])
        if buffered:
            logger.info(f"Flushing {len(buffered)} buffered events to new client [{workflow_id}]")
            for event in buffered:
                try:
                    await websocket.send_text(json.dumps(event))
                except Exception as e:
                    logger.warning(f"WS flush failed: {e}")
                    break

    def disconnect(self, workflow_id: str, websocket: WebSocket):
        if websocket in self.active[workflow_id]:
            self.active[workflow_id].remove(websocket)
        logger.info(f"WS disconnected: workflow={workflow_id}")

    async def emit(self, workflow_id: str, data: dict):
        """Send a JSON event to all clients watching this workflow.
        If no client is connected yet, buffer the event for later delivery."""
        clients = self.active.get(workflow_id, [])

        if not clients:
            # Buffer for when the client connects
            buf = self._buffer[workflow_id]
            if len(buf) < BUFFER_MAX:
                buf.append(data)
            logger.debug(f"WS buffered event [{data.get('type')}] for workflow {workflow_id} (no client yet)")
            return

        message = json.dumps(data)
        dead = []
        for ws in clients:
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
