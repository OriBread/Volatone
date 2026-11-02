# Pentatonic scale mapping (C Minor Pentatonic: C, Eb, F, G, Bb), one octave up
# for a brighter voice. Every pitch here must have a lane in the frontend roll
# (frontend/src/lib/layout.ts ROLL_OCTAVE_BASE).
PENTATONIC_NOTES = ["C4", "Eb4", "F4", "G4", "Bb4"]

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

    # 2. Velocity (loudness): from the magnitude of change (arbitrarily absolute value).
    # 0% change = 40 (quiet), FULL_SCALE change = 127 (loud); MIDI 1.0 has 128 levels.
    magnitude = abs(price_change)
    velocity = int(40 + magnitude * 87)
    velocity = max(40, min(127, velocity))  # [40, 127]

    # 3. Duration (arbitrary choice): inversely related to volatility.
    # High volatility = short, staccato notes.
    duration_ms = int(500 - magnitude * 400)  # [100, 500]

    return {
        "pitch": pitch,
        "velocity": velocity,
        "duration_ms": duration_ms,
        "trigger_price": price,
    }
