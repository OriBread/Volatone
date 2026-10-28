// Mirrors backend/src/volatone/schemas/events.py (NoteEvent)
export interface NoteEvent {
  pitch: string // scientific pitch notation, e.g. "Eb3"
  velocity: number // MIDI velocity, 0 to 127
  duration_ms: number
  timestamp_ms: number // Unix epoch ms (when the tick was generated)
}

export interface TickAndNote {
  type: 'tick_and_note'
  price: number
  note: NoteEvent
}
