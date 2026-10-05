"""REST endpoints for request/response data (config, stream lists, history)."""

from fastapi import APIRouter

from volatone import __version__
from volatone.config import get_settings

router = APIRouter()


@router.get("/health")
def health() -> dict[str, str]:
    """Liveness check (to be used by deployment tooling and CI smoke tests)"""
    return {
        "status": "ok",
        "version": __version__,
        "environment": get_settings().environment,
    }
