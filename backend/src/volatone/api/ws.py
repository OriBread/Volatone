"""WebSocket endpoint that will stream note events to the browser."""

import asyncio
import random

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from ..engine.core import calculate_price_change, generate_note_from_change
from ..schemas.events import NoteEvent
from .ws_manager import manager

router = APIRouter(tags=["websocket"])


# --- Health ---


@router.websocket("/hello")
async def hello_stream(websocket: WebSocket) -> None:
    """Accept a client and say hello. Ping test"""
    await websocket.accept()
    await websocket.send_json({"type": "hello"})
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        pass


# --- Note Streaming ---

# Mock previous price for checking demo
_mock_previous_price = 65000.0


async def market_data_generator() -> None:
    """Runs exactly ONCE in the background, broadcasting to all clients."""
    global _mock_previous_price
    while True:
        # Later we will replace this while loop with an ingestion task
        # that listens to the real Gemini WebSocket and calls the engine.

        await asyncio.sleep(1.0)  # ARBITRARILY 1 tick per second for MVP

        # 1. Simulate market move
        move = random.uniform(-150, 150)
        current_price = _mock_previous_price + move
        _mock_previous_price = current_price

        # 2. Run pure engine
        price_change = calculate_price_change(current_price, _mock_previous_price - move)
        note_data = generate_note_from_change(price_change, current_price)

        # 3. Construct validated shcema
        event = NoteEvent(
            pitch=note_data["pitch"],
            velocity=note_data["velocity"],
            duration_ms=note_data["duration_ms"],
            timestamp_ms=int(asyncio.get_event_loop().time() * 1000),
        )

        # 4. Broadcast to all connected frontends
        await manager.broadcast(
            {"type": "tick_and_note", "price": current_price, "note": event.model_dump()}
        )


@router.websocket("/stream")
async def websocket_stream(websocket: WebSocket) -> None:
    """Accepts a client and keeps the connection alive. Data is pushed by the background task"""
    await manager.connect(websocket)
    try:
        # Just wait for the client to disconnect or send a command (e.g., "pause")
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
