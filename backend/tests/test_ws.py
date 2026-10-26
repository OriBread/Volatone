import asyncio
import random
from typing import Any

import pytest
from fastapi.testclient import TestClient

from volatone.main import create_app


def test_websocket_sends_hello(client: TestClient) -> None:
    with client.websocket_connect("/ws/hello") as websocket:
        assert websocket.receive_json() == {"type": "hello"}


def test_websocket_stream_sends_tick_and_note(
    client: TestClient,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    original_sleep = asyncio.sleep

    async def yield_to_event_loop(_: float) -> None:
        await original_sleep(0)

    monkeypatch.setattr(asyncio, "sleep", yield_to_event_loop)
    monkeypatch.setattr(random, "uniform", lambda _low, _high: 100.0)

    with (
        TestClient(create_app()) as client,
        client.websocket_connect("/ws/stream") as websocket,
    ):
        message: dict[str, Any] = websocket.receive_json()

    assert message["type"] == "tick_and_note"
