"""Application entry point: builds the FastAPI app."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from volatone import __version__
from volatone.api.routes import router as rest_router
from volatone.api.ws import router as ws_router
from volatone.config import get_settings


def create_app() -> FastAPI:
    """Application factory: makes the app testable and configurable."""
    settings = get_settings()
    app = FastAPI(title="Volatone", version=__version__)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(rest_router, prefix="/api")
    app.include_router(ws_router)
    return app


app = create_app()
