import type { TickAndNote } from '../types/events'

const isNumber = (v: unknown): v is number => typeof v == 'number' && Number.isFinite(v)
const isString = (v: unknown): v is string => typeof v === 'string'
const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v != null

/** Turn raw WebSocket text into a TickAndNote, or null if it isn't one. */
export function parseTickAndNote(text: string): TickAndNote | null {
  let raw: unknown
  try {
    raw = JSON.parse(text)
  } catch {
    return null
  }
  if (!isRecord(raw) || raw.type !== 'tick_and_note' || !isNumber(raw.price)) return null
  const note = raw.note
  if (
    !isRecord(note) ||
    !isString(note.pitch) ||
    !isNumber(note.velocity) ||
    !isNumber(note.duration_ms) ||
    !isNumber(note.timestamp_ms)
  ) {
    return null
  }
  return {
    type: 'tick_and_note',
    price: raw.price,
    note: {
      pitch: note.pitch,
      velocity: note.velocity,
      duration_ms: note.duration_ms,
      timestamp_ms: note.timestamp_ms,
    },
  }
}
