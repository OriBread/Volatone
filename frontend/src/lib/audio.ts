import * as Tone from 'tone'

import type { NoteEvent } from '../types/events'

export interface AudioEngine {
  /** Unlock audio. Must be called from a user gesture (a click handler). */
  start(): Promise<void>
  /** Play a note now. Does nothing until start() has been called. */
  play(note: NoteEvent): void
  stop(): void
}

export function createAudioEngine(): AudioEngine {
  let synth: Tone.PolySynth | null = null
  let limiter: Tone.Limiter | null = null

  return {
    async start() {
      await Tone.start() // resumes the browser's suspended AudioContext
      if (synth) return
      // A limiter caps loud peaks so overlapping loud notes can't clip.
      limiter = new Tone.Limiter(-2).toDestination()
      // PolySynth = several voices, so overlapping notes ring together.
      synth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.02, decay: 0.1, sustain: 0.3, release: 1 },
      })
      synth.connect(limiter)
    },

    play(note) {
      // Tone expects velocity 0..1; backend sends MIDI 0..127
      synth?.triggerAttackRelease(
        note.pitch,
        note.duration_ms / 1000,
        Tone.now(),
        note.velocity / 127,
      )
    },

    stop() {
      synth?.releaseAll()
      synth?.dispose()
      limiter?.dispose()
      synth = null
      limiter = null
    },
  }
}
