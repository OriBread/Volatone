"""WebSocket endpoint that will (atsp) stream note events to the browser."""

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter()


@router.websocket("/ws")
async def stream(websocket: WebSocket) -> None:
    """Accept a client and say hello. Will add real note streaming later."""
    await websocket.accept()
    await websocket.send_json({"type": "hello"})
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        pass
