from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func

from .base import Base


class Stream(Base):
    __tablename__ = "streams"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String, nullable=False, unique=True)  # e.g. "gemini_btc_usd"
    description: Mapped[str | None] = mapped_column(String, nullable=True)


class Tick(Base):
    __tablename__ = "ticks"

    # Composite primary key. It must include the time column to be a TimescaleDB hypertable.
    stream_id: Mapped[int] = mapped_column(ForeignKey("streams.id"), primary_key=True)
    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), primary_key=True, server_default=func.now(), index=True
    )
    price: Mapped[float] = mapped_column(Float, nullable=False)
    volume: Mapped[float] = mapped_column(Float, nullable=False)
