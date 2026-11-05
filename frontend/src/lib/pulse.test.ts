import { describe, expect, it } from 'vitest'
import { PLAYED_SETTLE_MS, playedPulse } from './pulse'

describe('playedPulse', () => {
  it('is 0 while the note is still travelling (before the crossing)', () => {
    expect(playedPulse(-500, 250)).toBe(0)
    expect(playedPulse(-1, 250)).toBe(0)
  })

  it('peaks at 1 exactly at the crossing, where the sound starts', () => {
    expect(playedPulse(0, 250)).toBe(1)
  })

  it("holds at 1 while the sound plays (the note's full duration)", () => {
    expect(playedPulse(120, 250)).toBe(1)
    expect(playedPulse(250, 250)).toBe(1) // boundary: still held
    expect(playedPulse(400, 500)).toBe(1) // long note still held past 350ms
  })

  it('settles back to 0 over PLAYED_SETTLE_MS once the sound has finished', () => {
    expect(playedPulse(250 + PLAYED_SETTLE_MS / 2, 250)).toBeGreaterThan(0)
    expect(playedPulse(250 + PLAYED_SETTLE_MS / 2, 250)).toBeLessThan(1)
    expect(playedPulse(250 + PLAYED_SETTLE_MS, 250)).toBe(0)
  })
})
