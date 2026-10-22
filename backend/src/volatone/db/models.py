from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.sql import func

from .base import Base


class Stream(Base):
    __tablename__ = "streams"
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False, unique=True)  # e.g. "gemini_btc_usd"
    description = Column(String, nullable=True)


class Tick(Base):
    __tablename__ = "ticks"
    id = Column(Integer, primary_key=True, autoincrement=True)
    stream_id = Column(Integer, ForeignKey("streams.id"), nullable=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    price = Column(Float, nullable=False)
    volume = Column(Float, nullable=False)
    # In prod, we would run: SELECT create_hypertable('ticks', 'timestamp')
    # via an Alembic migration to nable TimescaleDB optimisations.


class Note(Base):
    __tablename__ = "notes"
    id = Column(Integer, primary_key=True, autoincrement=True)
    tick_id = Column(Integer, ForeignKey("ticks.id"), nullable=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    pitch = Column(String, nullable=False)  # e.g., "c4", "F#5"
    velocity = Column(Integer, nullable=False)  # 0-127
    duration_ms = Column(Integer, nullable=False)
