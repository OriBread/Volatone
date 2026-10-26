from collections.abc import AsyncGenerator
from datetime import UTC, datetime
from unittest.mock import AsyncMock, MagicMock

from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import AsyncSession

from volatone.db.models import Tick
from volatone.db.session import get_db
from volatone.main import create_app


# Smoke test the HTTP API health liveness endpoint.
def test_health_returns_ok(client: TestClient) -> None:
    response = client.get("/api/health")

    assert response.status_code == 200
    assert response.json()["status"] == "ok"


# Verify the history REST endpoint correctly queries and returns database ticks and notes.
def test_recent_history_returns_ticks_with_derived_notes() -> None:
    app = create_app()

    first_timestamp = datetime(2026, 1, 2, 12, 0, tzinfo=UTC)
    second_timestamp = datetime(2026, 1, 1, 12, 0, tzinfo=UTC)

    first_tick = Tick(price=65000.0, timestamp=first_timestamp)
    second_tick = Tick(price=64000.0, timestamp=second_timestamp)

    result = MagicMock()
    result.scalars.return_value.all.return_value = [first_tick, second_tick]  # newest first

    # Setup mock database session to replace actual
    db = AsyncMock(spec=AsyncSession)
    db.execute.return_value = result

    async def override_get_db() -> AsyncGenerator[AsyncSession]:
        yield db

    app.dependency_overrides[get_db] = override_get_db

    # Ensure mocked database session always clears
    # (prevent db sessions don't leak to other tests)
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
            "pitch": "Bb3",
            "velocity": 127,
        },
    ]

    db.execute.assert_awaited_once()
