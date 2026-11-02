import { describe, expect, it, vi } from 'vitest'

// vi.mock is hoisted above imports, so shared fakes must come from vi.hoisted.
const fakes = vi.hoisted(() => ({
  trigger: vi.fn(),
  releaseAll: vi.fn(),
  dispose: vi.fn(),
}))

vi.mock('tone', () => ({
  start: vi.fn().mockResolvedValue(undefined),
  now: () => 10, // the audio clock reads 10 s (already lookAhead-inclusive)
  // Tone.getContext(): lookAhead 0.1 s, hardware latency 0.1 s, per the mocks below.
  getContext: () => ({
    lookAhead: 0.1,
    rawContext: { outputLatency: 0.1 },
  }),
  MonoSynth: class {},
  PolySynth: class {
    toDestination() {
      return this
    }
    triggerAttackRelease = fakes.trigger
    releaseAll = fakes.releaseAll
    dispose = fakes.dispose
  },
}))

import { createAudioEngine } from './audio'

const note = { pitch: 'Eb3', velocity: 100, duration_ms: 250, timestamp_ms: 1 }

describe('createAudioEngine', () => {
  it('does nothing before start() is called', () => {
    createAudioEngine().play(note)
    expect(fakes.trigger).not.toHaveBeenCalled()
  })

  it('plays the string voice with ms→seconds and floored velocity once started', async () => {
    const audio = createAudioEngine()
    await audio.start()
    audio.play(note)
    // Exactly one voice, no effects. Velocity passes through the 0.25..1 floor
    // first: 0.25 + 0.75 * (100/127) ≈ 0.841. Play's delay is 0: the scheduled
    // time would fall before now(), so the clamp pins it to Tone.now() = 10.
    expect(fakes.trigger).toHaveBeenCalledWith('Eb3', 0.25, 10, 0.25 + 0.75 * (100 / 127))
    expect(fakes.trigger).toHaveBeenCalledTimes(1)
  })

  it('schedules a future note on the audio clock, lookAhead- and latency-corrected', async () => {
    const audio = createAudioEngine()
    await audio.start()
    audio.schedule(note, 2000)
    // now(10) + 2 s - LOOKAHEAD_S(0.15) - outputLatency(0.1): the note must be
    // queued on the audio thread to emerge 2 s from the scheduling instant,
    // not 2.25 s (the classic Tone.now() lateness).
    expect(fakes.trigger).toHaveBeenCalledWith('Eb3', 0.25, 11.75, 0.25 + 0.75 * (100 / 127))
  })

  it('goes silent again after stop()', async () => {
    fakes.trigger.mockClear()
    const audio = createAudioEngine()
    await audio.start()
    audio.stop()
    audio.play(note)
    expect(fakes.trigger).not.toHaveBeenCalled()
  })

  it('remembers nothing across a stop()/start() cycle (fresh instrument built)', async () => {
    const audio = createAudioEngine()
    await audio.start()
    audio.stop()
    await audio.start()
    audio.play(note)
    expect(fakes.trigger).toHaveBeenCalled()
  })
})
