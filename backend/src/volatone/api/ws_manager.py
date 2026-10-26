import asyncio
import json
from typing import Any

from fastapi import WebSocket


class ConnectionManager:
    def __init__(self) -> None:
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket) -> None:
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket) -> None:
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict[Any, Any]) -> None:
        payload = json.dumps(message)
        connections = list(self.active_connections)

        async def send(conn: WebSocket) -> bool:
            try:
                await asyncio.wait_for(conn.send_text(payload), timeout=1.0)
                return True
            except Exception:
                return False

        results = await asyncio.gather(*(send(c) for c in connections))
        for conn, ok in zip(connections, results, strict=True):
            if not ok:
                self.disconnect(conn)


manager = ConnectionManager()
