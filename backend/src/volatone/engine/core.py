# Pentatonic scale mapping (C Minor Pentatonic: C, Eb, F, G, Bb)
# We map a normalised price change (-1.0 to 1.0) to these 5 notes.
PENTATONIC_NOTES = ["C3", "Eb3", "F3", "G3", "Bb3"]

FULL_SCALE = 0.002  # a 0.2% move between ticks = "maximum" (ARBITRARY)


def calculate_price_change(current_price: float, previous_price: float) -> float:
    """Returns normalised change: -1.0 (>= FULL_SCALE drop) to 1.0 (>= FULL_SCALE rise)."""
    if previous_price == 0:
        return 0.0
    change = (current_price - previous_price) / previous_price
    return max(-1.0, min(1.0, change / FULL_SCALE))


def generate_note_from_change(price_change: float, price: float) -> dict[str, str | int | float]:
    """
    Pure function: maps price change to a musical note.
    No framework imports therefore no side effects.
    """
    # 1. Pitch: Map normalised change to pentatonic index
    # -1.0 -> 0, 0.0 -> 2, 1.0 -> 4
    idx = round((price_change + 1.0) / 2.0 * (len(PENTATONIC_NOTES) - 1))
    pitch = PENTATONIC_NOTES[idx]

    # 2. Velocity: (volume): Based on magnitude of change (ARBITRARILY absolute value)
    # 0% change = 40 (quiet), >2% change = 127 (loud)
    # based on MIDI 1.0's 128 velocity levels
    magnitude = abs(price_change)
    velocity = int(40 + magnitude * 87)
    velocity = max(40, min(127, velocity))  # [40, 127]

    # 3. Duration: ARBITRARILY Inversely related to volatility.
    # High volatility = short, staccato notes.
    duration_ms = int(500 - magnitude * 400)  # [100, 500]

    return {
        "pitch": pitch,
        "velocity": velocity,
        "duration_ms": duration_ms,
        "trigger_price": price,
    }
