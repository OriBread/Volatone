import pytest

from volatone.engine.core import (
    PENTATONIC_NOTES,
    calculate_price_change,
    generate_note_from_change,
)


def test_no_price_move_is_zero_change() -> None:
    assert calculate_price_change(100.0, 100.0) == 0.0


def test_zero_previous_price_is_safe() -> None:
    assert calculate_price_change(100.0, 0.0) == 0.0


def test_change_is_clamped_to_unit_range() -> None:
    assert calculate_price_change(150.0, 100.0) == 1.0
    assert calculate_price_change(50.0, 100.0) == -1.0


def test_small_move_is_proportional_not_clamped() -> None:
    # A 0.1% rise is half of FULL_SCALE (0.2%), so about 0.5.
    assert calculate_price_change(100.1, 100.0) == pytest.approx(0.5)


def test_flat_market_is_quiet_and_long() -> None:
    note = generate_note_from_change(0.0, 100.0)
    assert note["pitch"] == "F3"  # middle of the scale
    assert note["velocity"] == 40
    assert note["duration_ms"] == 500


def test_biggest_moves_are_loud_and_short() -> None:
    for change in (-1.0, 1.0):
        note = generate_note_from_change(change, 100.0)
        assert note["velocity"] == 127
        assert note["duration_ms"] == 100


def test_falls_play_low_and_rises_play_high() -> None:
    assert generate_note_from_change(-1.0, 1.0)["pitch"] == PENTATONIC_NOTES[0]
    assert generate_note_from_change(1.0, 1.0)["pitch"] == PENTATONIC_NOTES[-1]


def test_every_pentatonic_note_is_reachable() -> None:
    # Regression test for the original bug: the engine only ever produced two pitches.
    sweep = [i / 4 for i in range(-4, 5)]  # -1.0, -0.75 ... 1.0
    pitches = {generate_note_from_change(c, 1.0)["pitch"] for c in sweep}
    assert pitches == set(PENTATONIC_NOTES)


def test_velocity_rises_and_duration_falls_with_magnitude() -> None:
    notes = [generate_note_from_change(c, 1.0) for c in (0.0, 0.25, 0.5, 0.75, 1.0)]
    velocities = [int(n["velocity"]) for n in notes]
    durations = [int(n["duration_ms"]) for n in notes]
    assert velocities == sorted(velocities)
    assert durations == sorted(durations, reverse=True)


def test_engine_is_deterministic() -> None:
    assert generate_note_from_change(0.3, 100.0) == generate_note_from_change(0.3, 100.0)
