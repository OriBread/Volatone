"""Messages the backend sends to the browser. Mirrored in frontend/src/types/events.ts."""

from pydantic import BaseModel, Field


class NoteEvent(BaseModel):
    """Play a note: backend decides *what", browser decides *how* it sounds"""

    pitch: str = Field(examples=["C4"], description="Scientific pitch notation")
    velocity: int = Field(ge=0, le=127, description="Loudness, 0 to 127")
    duration_ms: int = Field(gt=0, description="Note length in milliseconds")
    timestamp_ms: int = Field(description="Source tick time, Unix epoch ms")
