import type { StreamEvent } from '../hooks/useVolatoneStream'
import type { FeedRow, RollNote, SeriesPoint } from '../types/view'

/**
 * This is the only place where backend event shape meets UI shape.
 * Pure functions: no sockets, no React, no clock. Testable without rendering.
 */

function timeOfDay(epochMs: number): string {
  const d = new Date(epochMs)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

function deltaPctFor(previousPrice: number | null, price: number): number | null {
  return previousPrice === null ? null : ((price - previousPrice) / previousPrice) * 100
}

export function toSeries(events: readonly StreamEvent[]): SeriesPoint[] {
  let previousPrice: number | null = null
  return events.map((event) => {
    const deltaPct = deltaPctFor(previousPrice, event.price)
    previousPrice = event.price
    return { id: String(event.id), price: event.price, deltaPct, note: event.note.pitch }
  })
}

/** Newest first (LiveFeed), carrying the engine's epoch time formatted as local HH:MM:SS. */
export function toFeedRows(events: readonly StreamEvent[], limit = 8): FeedRow[] {
  let previousPrice: number | null = null
  return events
    .map((event) => {
      const deltaPct = deltaPctFor(previousPrice, event.price)
      previousPrice = event.price
      return {
        id: String(event.id),
        time: timeOfDay(event.note.timestamp_ms),
        note: event.note.pitch,
        price: event.price,
        deltaPct,
      }
    })
    .slice(-limit)
    .reverse()
}

export function toRollNotes(events: readonly StreamEvent[]): RollNote[] {
  return events.map((event) => ({
    id: String(event.id),
    pitch: event.note.pitch, // verbatim: lane lookup normalises spellings (Eb3 -> D#3)
    velocity: event.note.velocity,
    durationMs: event.note.duration_ms,
    timestampMs: event.note.timestamp_ms,
    arrivedMs: event.arrivedAt,
  }))
}
