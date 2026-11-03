import { describe, expect, it } from 'vitest'

import fixture from '../fixtures/engine-scale.json'
import { LANE_BY_PITCH, normalizePitch } from './layout'

/* Contract between the engine's scale and the roll's lanes: every pitch the
   backend may emit (fixture in src/fixtures/engine-scale.json) must normalize
   to a lane. If both sides drift apart, a note silently disappears from the
   roll (NotesLayer skips unknown lanes) — this test makes that failure loud. */
describe('engine scale ↔ roll lanes contract', () => {
  it('gives every engine scale note a lane', () => {
    const missing = fixture.notes
      .map((pitch) => normalizePitch(pitch)) // engine spellings are flat (Eb4); lanes are sharp (D#4)
      .filter((normalized) => !LANE_BY_PITCH.has(normalized))
    expect(missing).toEqual([])
  })
})

describe('normalizePitch', () => {
  it('maps flat engine spellings onto sharp lanes', () => {
    expect(normalizePitch('Eb3')).toBe('D#3')
    expect(normalizePitch('Bb4')).toBe('A#4')
    expect(normalizePitch('C4')).toBe('C4')
  })

  it('keeps multi-digit octaves intact (regression: last-char slicing corrupted them)', () => {
    expect(normalizePitch('C10')).toBe('C10')
    expect(normalizePitch('Db10')).toBe('C#10')
  })

  it('keeps negative octaves intact', () => {
    expect(normalizePitch('C-1')).toBe('C-1')
    expect(normalizePitch('Bb-1')).toBe('A#-1')
  })

  it('passes through unrecognizable input instead of crashing', () => {
    expect(normalizePitch('H7')).toBe('H7')
  })
})
