from collections.abc import AsyncIterator
from datetime import UTC, datetime
from unittest.mock import AsyncMock, MagicMock

from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import AsyncSession

from volatone.db.models import Note, Tick
from volatone.db.session import get_db
from volatone.main import create_app


def test_health_returns_ok(client: TestClient) -> None:
    response = client.get("/api/health")

    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_recent_history_returns_ticks_and_notes() -> None:
    app = create_app()

    first_timestamp = datetime(2026, 1, 2, 12, 0, tzinfo=UTC)
    second_timestamp = datetime(2026, 1, 1, 12, 0, tzinfo=UTC)

    first_tick = Tick(price=65000.0, timestamp=first_timestamp)
    first_note = Note(pitch="C3", velocity=80, duration_ms=250)

    second_tick = Tick(price=64000.0, timestamp=second_timestamp)
    second_note = Note(pitch="G3", velocity=60, duration_ms=400)

    result = MagicMock()
    result.all.return_value = [
        (first_tick, first_note),
        (second_tick, second_note),
    ]

    db = AsyncMock(spec=AsyncSession)
    db.execute.return_value = result

    async def override_get_db() -> AsyncIterator[AsyncSession]:
        yield db

    app.dependency_overrides[get_db] = override_get_db

    try:
        with TestClient(app) as client:
            response = client.get("/api/history/recent")
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 200
    assert response.json() == [
        {
            "timestamp": first_timestamp.isoformat(),
            "price": 65000.0,
            "pitch": "C3",
            "velocity": 80,
        },
        {
            "timestamp": second_timestamp.isoformat(),
            "price": 64000.0,
            "pitch": "G3",
            "velocity": 60,
        },
    ]

    db.execute.assert_awaited_once()
