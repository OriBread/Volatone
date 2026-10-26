"""REST endpoints for request/response data (config, stream lists, history)."""

from typing import Any

from fastapi import APIRouter, Depends
from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from volatone import __version__
from volatone.config import get_settings

from ..db.models import Tick
from ..db.session import get_db
from ..engine.core import calculate_price_change, generate_note_from_change

router = APIRouter()

# --- Health ---


@router.get("/health")
def health() -> dict[str, str]:
    """Liveness check (to be used by deployment tooling and CI smoke tests)"""
    return {
        "status": "ok",
        "version": __version__,
        "environment": get_settings().environment,
    }


# --- History ---


@router.get("/history/recent", tags=["history"])
async def get_recent_ticks(
    limit: int = 50,
    db: AsyncSession = Depends(get_db),  # noqa: B008 NB: DI via parametetrised db
) -> list[dict[str, Any]]:
    """Recent ticks with the note the engine derives from each price move."""
    query = select(Tick).order_by(desc(Tick.timestamp)).limit(limit + 1)
    ticks = list((await db.execute(query)).scalars().all())  # newest first
    rows = []

    for tick, previous in zip(ticks, ticks[1:], strict=False):
        note = generate_note_from_change(
            calculate_price_change(tick.price, previous.price), tick.price
        )
        rows.append(
            {
                "timestamp": tick.timestamp.isoformat(),
                "price": tick.price,
                "pitch": note["pitch"],
                "velocity": note["velocity"],
            }
        )
    return rows
