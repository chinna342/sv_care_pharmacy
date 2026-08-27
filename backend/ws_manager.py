import json
import logging
from typing import Dict, List, Any
from fastapi import WebSocket

logger = logging.getLogger("svcare.websocket")
logger.setLevel(logging.INFO)

class WebSocketManager:
    """
    Real-time WebSocket Hub supporting role-based rooms (pharmacist, admin, delivery, customer)
    and broadcast event pub/sub.
    """
    def __init__(self):
        # Map channel/role to list of active WebSockets
        self.active_connections: Dict[str, List[WebSocket]] = {
            "all": [],
            "pharmacist": [],
            "admin": [],
            "delivery": [],
            "customer": []
        }

    async def connect(self, websocket: WebSocket, channel: str = "all"):
        await websocket.accept()
        if channel not in self.active_connections:
            self.active_connections[channel] = []
        self.active_connections[channel].append(websocket)
        self.active_connections["all"].append(websocket)
        logger.info(f"[WebSocket] Connected client on channel '{channel}'. Total active: {len(self.active_connections['all'])}")

    def disconnect(self, websocket: WebSocket, channel: str = "all"):
        if channel in self.active_connections and websocket in self.active_connections[channel]:
            self.active_connections[channel].remove(websocket)
        if websocket in self.active_connections["all"]:
            self.active_connections["all"].remove(websocket)
        logger.info(f"[WebSocket] Disconnected client from channel '{channel}'.")

    async def broadcast_event(self, event_type: str, data: Any, channels: List[str] = None):
        """
        Broadcasts an event message to all connected clients in the specified channels (or 'all').
        """
        if channels is None:
            channels = ["all"]

        message = {
            "event": event_type,
            "data": data
        }
        message_str = json.dumps(message)

        target_sockets = set()
        for ch in channels:
            if ch in self.active_connections:
                for ws in self.active_connections[ch]:
                    target_sockets.add(ws)

        dead_sockets = []
        for ws in target_sockets:
            try:
                await ws.send_text(message_str)
            except Exception as e:
                logger.warning(f"[WebSocket] Failed to send message: {e}")
                dead_sockets.append(ws)

        # Cleanup dead sockets
        for dead_ws in dead_sockets:
            for ch in self.active_connections:
                if dead_ws in self.active_connections[ch]:
                    self.active_connections[ch].remove(dead_ws)

    def broadcast_sync(self, event_type: str, data: Any, channels: List[str] = None):
        """Helper to invoke broadcast from sync route handlers across any thread."""
        import asyncio
        try:
            try:
                loop = asyncio.get_running_loop()
            except RuntimeError:
                loop = None

            if loop and loop.is_running():
                loop.create_task(self.broadcast_event(event_type, data, channels))
            else:
                asyncio.run(self.broadcast_event(event_type, data, channels))
        except Exception as err:
            logger.warning(f"[WebSocket] broadcast_sync fallback note: {err}")

ws_manager = WebSocketManager()
