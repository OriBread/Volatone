/**
 * Pulse shape for a just-played note in the piano roll.
 *
 * Pure function of time: NotesLayer feeds it
 * elapsed-since-crossing each rAF frame. The hold length is the note's
 * `duration_ms` — the SAME quantity lib/audio.ts passes to
 * `triggerAttackRelease`, so the visual pulse lasts exactly as long as the
 * sound does and the two can never drift apart.
 */

/** How long the pulse eases back to 0 once the sound has finished, settling
    into the plain played fade (independent of the note's length). */
export const PLAYED_SETTLE_MS = 350

/**
 * Strength (0..1) of the played note's pulse, given ms elapsed since the note
 * crossed the playhead (negative = still travelling) and the note's audible
 * duration in ms.
 *
 * 0 before the crossing, 1 exactly at it (the moment sound happens), held at
 * 1 while the synth sustains, then easing back to 0 over PLAYED_SETTLE_MS.
 * The ^2 eases the settle so the peak stays crisp into the fade.
 */
export function playedPulse(elapsedSinceCrossingMs: number, durationMs: number): number {
  if (elapsedSinceCrossingMs < 0) return 0
  if (elapsedSinceCrossingMs <= durationMs) return 1
  const settleProgress = Math.min((elapsedSinceCrossingMs - durationMs) / PLAYED_SETTLE_MS, 1)
  return Math.pow(1 - settleProgress, 2)
}
