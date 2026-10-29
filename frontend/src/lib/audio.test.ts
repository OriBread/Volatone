import { describe, expect, it, vi } from 'vitest'

// vi.mock is hoisted above imports, so shared fakes must come from vi.hoisted.
const fakes = vi.hoisted(() => ({ trigger: vi.fn(), releaseAll: vi.fn(), dispose: vi.fn() }))

vi.mock('tone', () => ({
  start: vi.fn().mockResolvedValue(undefined),
  now: () => 10, // the audio clock reads 10 s
  Synth: class {},
  Limiter: class {
    toDestination() {
      return this
    }
    dispose = fakes.dispose
  },
  PolySynth: class {
    connect() {
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

  it('converts ms to seconds and MIDI velocity to 0..1 once started', async () => {
    const audio = createAudioEngine()
    await audio.start()
    audio.play(note)
    expect(fakes.trigger).toHaveBeenCalledWith('Eb3', 0.25, 10, 100 / 127)
  })

  it('goes silent again after stop()', async () => {
    fakes.trigger.mockClear()
    const audio = createAudioEngine()
    await audio.start()
    audio.stop()
    audio.play(note)
    expect(fakes.trigger).not.toHaveBeenCalled()
  })
})
