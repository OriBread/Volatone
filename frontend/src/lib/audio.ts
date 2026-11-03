import type { NoteEvent } from '../types/events'
import * as Tone from 'tone'

export interface AudioEngine {
  /** Unlock the AudioContext and build the instrument. Must happen in a user gesture. */
  start(): Promise<void>
  /** Play one note right now (schedule-0 convenience; still latency-corrected).
   *  Deliberately kept even though the App's live stream path only calls
   *  schedule(): it is the latency-correction probe at the zero-delay clamp
   *  (audio.test.ts uses it to pin that path). */
  play(note: NoteEvent): void
  /**
   * Schedule a note to sound delayMs from *this instant*, on the audio clock.
   *
   * The sync path: corrects for Tone's lookAhead (why default `Tone.now()`
   * scheduling always sounds late) and for the hardware's outputLatency, so the
   * audible onset lands after exactly delayMs of real time — matching the
   * playhead animation. The note is queued far ahead on the audio thread,
   * which is glitch-safe by construction.
   */
  schedule(note: NoteEvent, delayMs: number): void
  /** Release everything, so the next start() rebuilds the instrument. */
  stop(): void
}

/** Low-velocity notes sound no softer than this fraction of full loudness. */
const VELOCITY_FLOOR = 0.25

/** Tone's lookAhead (0.1 default, adjust for delay): how far ahead Tone.now() sits from the real clock. */
const LOOKAHEAD_S = 0.1
/** Audio by-ear sync trimming (seconds). */
const AUDIO_SYNC_TRIM_S = 0.05

const seconds = (ms: number) => ms / 1000

/** Output latency of the raw context in seconds (baseLatency as fallback, 0 if unknown). */
function outputLatencyS(): number {
  const rawCtx = Tone.getContext().rawContext
  return 'outputLatency' in rawCtx && typeof rawCtx.outputLatency === 'number'
    ? rawCtx.outputLatency
    : 'baseLatency' in rawCtx && typeof rawCtx.baseLatency === 'number'
      ? rawCtx.baseLatency
      : 0
}

/* Transits shorter than this clamp to "now" on the audio clock (see
   scheduleInternal's Math.max), which would stack several notes into one
   chord. Exposed for the backfill path, which must therefore stay silent for
   anything closer than this — derived from the SAME constants and latency the
   clamping in scheduleInternal uses, so the two can never drift apart. */
export function clampThresholdMs(): number {
  return (LOOKAHEAD_S + AUDIO_SYNC_TRIM_S + outputLatencyS()) * 1000
}

export function createAudioEngine(): AudioEngine {
  let voice: Tone.PolySynth | null = null

  // Single source of truth for sounding a note: velocity floor, latency
  // correction, and trigger
  const scheduleInternal = (note: NoteEvent, delayMs: number) => {
    if (!voice) return
    const velocity = VELOCITY_FLOOR + (1 - VELOCITY_FLOOR) * (note.velocity / 127)

    // Where "delayMs from now" sits on the audio clock. Tone.now() already
    // includes the lookAhead, so the scheduled time is pulled earlier by the
    // lookAhead and the hardware latency; the note then *emerges* from the
    // speakers at exactly the intended moment instead of after both delays.
    const target = Tone.now() + seconds(delayMs)
    const when = Math.max(target - LOOKAHEAD_S - AUDIO_SYNC_TRIM_S - outputLatencyS(), Tone.now())

    voice.triggerAttackRelease(note.pitch, seconds(note.duration_ms), when, velocity)
  }

  return {
    start: async () => {
      await Tone.start() // resumes the suspended context; needs the user gesture
      if (voice) return

      voice = new Tone.PolySynth(Tone.MonoSynth, {
        oscillator: { type: 'triangle' }, // single clean oscillator; harmonics keep C3-Bb3 audible on small speakers
        filter: {
          type: 'lowpass',
          rolloff: -12, // gentle slope: 12 dB/octave
          Q: 0.5,
        },
        filterEnvelope: {
          attack: 0.002,
          decay: 0.12,
          sustain: 0.2,
          release: 0.1,
          baseFrequency: 600,
          octaves: 3, // peak ~4.8 kHz
        },
        envelope: {
          attack: 0.003, // near-instant onset so each datum is a distinct event
          decay: 0.12,
          sustain: 0.25, // non-zero so duration_ms is audible as a held tail
          release: 0.12, // short fade, no tail
          releaseCurve: 'exponential',
        },
        volume: 0,
      }).toDestination()
    },

    play(note) {
      scheduleInternal(note, 0)
    },

    schedule(note, delayMs) {
      scheduleInternal(note, delayMs)
    },

    stop: () => {
      voice?.releaseAll()
      voice?.dispose()
      voice = null
    },
  }
}
