"""Application entry point: builds the FastAPI app."""

import asyncio
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager, suppress

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from volatone import __version__
from volatone.api.routes import router as rest_router
from volatone.api.ws import market_data_generator
from volatone.api.ws import router as ws_router
from volatone.config import get_settings


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None]:
    """Manage application startup and shutdown events."""
    # 1. Startup: Start the single background market data generator
    background_task = asyncio.create_task(market_data_generator())

    yield  # App is running here

    # 2. Shutdown: Cancel the background task cleanly
    background_task.cancel()
    with suppress(asyncio.CancelledError):
        await background_task


def create_app() -> FastAPI:
    """Application factory: makes the app testable and configurable."""
    settings = get_settings()

    # Pass the lifespan manager to FastAPI
    app = FastAPI(title="Volatone", version=__version__, lifespan=lifespan)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(rest_router, prefix="/api")
    app.include_router(ws_router, prefix="/ws")
    return app


app = create_app()
