"""REST endpoints for request/response data (config, stream lists, history)."""

from typing import Any

from fastapi import APIRouter, Depends
from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from volatone import __version__
from volatone.config import get_settings

from ..db.models import Note, Tick
from ..db.session import get_db

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
    """Fetch recent ticks and their sonified notes for UI initialisation"""
    query = (
        select(Tick, Note)
        .join(Note, Tick.id == Note.tick_id)
        .order_by(desc(Tick.timestamp))
        .limit(limit)
    )
    result = await db.execute(query)
    rows = result.all()

    return [
        {
            "timestamp": tick.timestamp.isoformat(),
            "price": tick.price,
            "pitch": note.pitch,
            "velocity": note.velocity,
        }
        for tick, note in rows
    ]
