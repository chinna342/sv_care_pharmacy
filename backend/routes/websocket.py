import logging
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from ws_manager import ws_manager

logger = logging.getLogger("svcare.ws_route")

router = APIRouter(
    tags=["Real-Time WebSockets Engine"]
)

@router.websocket("/ws/{channel}")
async def websocket_endpoint(websocket: WebSocket, channel: str = "all"):
    """
    Subscribes client to real-time events on channel: 'pharmacist', 'admin', 'delivery', 'customer', or 'all'.
    """
    await ws_manager.connect(websocket, channel)
    try:
        while True:
            # Keep-alive receive loop
            data = await websocket.receive_text()
            # If client sends ping, respond with pong
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket, channel)
    except Exception as e:
        logger.warning(f"WebSocket connection error on channel {channel}: {e}")
        ws_manager.disconnect(websocket, channel)
