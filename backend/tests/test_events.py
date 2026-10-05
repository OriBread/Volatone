import pytest
from pydantic import ValidationError

from volatone.schemas.events import NoteEvent


def test_note_event_accepts_valid_values() -> None:
    note = NoteEvent(pitch="C4", velocity=0.8, duration_ms=250, timestamp_ms=1_700_000_000_000)
    assert note.pitch == "C4"


def test_note_event_rejects_out_of_range_velocity() -> None:
    with pytest.raises(ValidationError):
        NoteEvent(pitch="C4", velocity=1.5, duration_ms=250, timestamp_ms=0)
