import random  # noqa: F401

# Pentatonic scale mapping (C Minor Pentatonic: C, Eb, F, G, Bb)
# We map a normalised price change (-1.0 to 1.0) to these 5 notes.
PENTATONIC_NOTES = ["C3", "Eb3", "F3", "G3", "Bb3"]


def calculate_price_change(current_price: float, previous_price: float) -> float:
    """Returns normalised change: -1.0 (max drop) to 1.0 (max rise)."""
    if previous_price == 0:
        return 0.0
    change = (current_price - previous_price) / previous_price
    # Clamp to [-1.0, 1.0] for sanity
    return max(-1.0, min(1.0, change * 100))  # Mult by 100 ARBITRARILY for small price movements


def generate_note_from_change(price_change: float, price: float) -> dict[str, str | int | float]:
    """
    Pure function: maps price change to a musical note.
    No framework imports therefore no side effects.
    """
    # 1. Pitch: Map normalised change to pentatonic index
    # -1.0 -> 0, 0.0 -> 2, 1.0 -> 4
    normalised_idx = int((price_change + 1.0) / 2.0 * (len(PENTATONIC_NOTES) - 1))
    pitch = PENTATONIC_NOTES[normalised_idx]

    # 2. Velocity: (volume): Based on magnitude of change (ARBITRARILY absolute value)
    # 0% change = 40 (quiet), >2% change = 127 (loud)
    # based on MIDI 1.0's 128 velocity levels
    magnitude = abs(price_change)
    velocity = int(40 + (magnitude / 0.02) * 87)
    velocity = max(40, min(127, velocity))  # [40, 127]

    # 3. Duration: ARBITRARILY Inversely related to volatility.
    # High volatility = short, staccato notes.
    duration_ms = int(500 - (magnitude / 0.02) * 400)
    duration_ms = max(100, min(500, duration_ms))  # [100, 500]

    return {
        "pitch": pitch,
        "velocity": velocity,
        "duration_ms": duration_ms,
        "trigger_price": price,
    }
