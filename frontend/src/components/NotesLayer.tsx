import { useEffect, useRef, useState } from 'react'
import { LANE_BY_PITCH, PLAYHEAD_X_PERCENT, TRAVEL_MS, normalizePitch } from '../lib/layout'
import { playedPulse } from '../lib/pulse'
import type { RollNote } from '../types/view'

export interface NotesLayerProps {
  notes: RollNote[]
  highlightedId: string | null
}

/** Fraction of the lane height trimmed off each side of natural notes. */
const NATURAL_INSET = 0.12
/** Accidentals sit in their own (already half-height) in-between lane. */
const ACCIDENTAL_INSET = 0.1

// Translucent light fill with a thin darker border; accidentals go deeper/more
// intense, like MIDI black keys. Palette mirrors the theme's --color-playhead.
const NATURAL_RGB = '46, 157, 230'
const ACCIDENTAL_RGB = '13, 118, 203'
const NATURAL_FILL_ALPHA = 0.32
const ACCIDENTAL_FILL_ALPHA = 0.8
const NATURAL_BORDER = '#1b74c9'
const ACCIDENTAL_BORDER = '#0b5cad'
const NOTE_RADIUS = 4
/** How faint a fully played note gets before it leaves the roll */
const PLAYED_MIN_OPACITY = 0.12
/** Opacity immediately after a note crosses the playhead. */
const PRESSED_OPACITY = 0.48

/* Played-note pulse: on top of the fade, a just-played note swells back OUT —
   slightly larger, with a deeper fill and a thicker border — at the exact
   crossing (the moment sound happens), then settles into the fade as it
   slides on.*/
const PLAYED_SCALE = 0.08 // growth past natural size at the crossing
const PLAYED_FILL_BOOST_NATURAL = 0.28 // fill alpha added at the crossing
const PLAYED_FILL_BOOST_ACCIDENTAL = 0.15
const PLAYED_BORDER_EXTRA_PX = 1 // border thickness added at the crossing
/* The pulse's length is per-note (see lib/pulse.ts): it holds while the synth
   sustains (durationMs, what audio.ts sounds via triggerAttackRelease) and
   settles over PLAYED_SETTLE_MS after — so the pulse lasts as long as the sound. */

/** Fraction of the travel span over which a note eases in after spawning at
    the right edge (a material fade of the note itself, not a fog overlay). */
const ENTRY_RAMP_FRACTION = 0.18
/** Ease exponent for the entry fade: <1 so notes appear quickly after spawn. */
const ENTRY_EASE = 0.7

export function NotesLayer({ notes, highlightedId }: NotesLayerProps) {
  /* Animation clock lives HERE, not in App: App re-renders only when events arrive;
    this component alone re-renders at 60fps while notes are visible. */
  const [now, setNow] = useState(() => performance.now())
  const layerRef = useRef<HTMLDivElement>(null)
  const [widthPx, setWidthPx] = useState(0)

  /* Mirror of the visibility culling in the render pass below. */
  const isNoteVisible = (note: RollNote, nowMs: number, rollWidthPx: number) => {
    const playheadPx = rollWidthPx * (PLAYHEAD_X_PERCENT / 100)
    const spanPx = rollWidthPx - playheadPx
    const leftPx = playheadPx + ((note.arrivedMs + TRAVEL_MS - nowMs) / TRAVEL_MS) * spanPx
    const noteWidthPx = (note.durationMs / TRAVEL_MS) * spanPx
    return leftPx + noteWidthPx > 0 && leftPx < rollWidthPx
  }

  /* The animation clock runs only while something is on the roll: a silent or
     disconnected stream costs no frames. The loop ticks 60fps while any note
     is visible, then parks itself; whenever `notes` or `widthPx` change (new note
     event arrived while parked, or a sidebar drag changed the visible span) this
     effect re-runs and a fresh rAF tick wakes it — and refreshes the clock with
     a live `now` in that same tick, so no stale-frame nudge is needed. */
  useEffect(() => {
    if (widthPx === 0) return // first paint before ResizeObserver fires: nothing visible
    let raf: number
    const tick = () => {
      const t = performance.now()
      if (notes.length > 0 && notes.some((note) => isNoteVisible(note, t, widthPx))) {
        setNow(t) // re-render only when something paints: 60fps while notes are visible
        raf = requestAnimationFrame(tick)
      }
      // else: loop stops; re-running this effect restarts it from the parked state
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
    // Re-evaluate when the set of notes or the canvas width changes (a resize can
    // bring an off-screen note back into view, so sleeping must cover both).
  }, [notes, widthPx])

  /* The layer's width in pixels is measured (and re-measured on resize, e.g. sidebar
     drags) so note positions can be expressed as device-pixel transforms. */
  useEffect(() => {
    const layer = layerRef.current
    if (!layer) return
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) setWidthPx(entry.contentRect.width)
    })
    observer.observe(layer) // fires once immediately, then on every resize
    return () => observer.disconnect()
  }, [])

  /* Horizontal motion is a translate3d transform only (lane geometry is static) */
  const playheadPx = widthPx * (PLAYHEAD_X_PERCENT / 100)
  const spanPx = widthPx - playheadPx

  return (
    <div ref={layerRef} className="absolute inset-0">
      {widthPx === 0
        ? null // first paint before the ResizeObserver fires: nothing to place yet
        : notes.map((note) => {
            // Engine spellings are normalised (Eb3 -> D#3) so a note always finds its lane.
            const lane = LANE_BY_PITCH.get(normalizePitch(note.pitch))
            if (!lane) return null // pitch outside the roll's octave: skip, don't crash

            /* At arrival the left edge sits at the roll's right edge; it drifts left and,
               after crossing the playhead, KEEPS GOING — sliding past and fading under
               the shade until it exits the roll. Onset meets the playhead exactly
               TRAVEL_MS after arrival, the same delay the audio fires on, so sight
               and sound line up.
               (The culling + these position formulas are mirrored in isNoteVisible
               above */
            const leftPx = playheadPx + ((note.arrivedMs + TRAVEL_MS - now) / TRAVEL_MS) * spanPx
            const noteWidthPx = (note.durationMs / TRAVEL_MS) * spanPx

            if (leftPx + noteWidthPx <= 0) return null // fully slid off the left edge
            if (leftPx >= widthPx) return null // not visible yet

            /* Entry fade: opacity ramps 0 -> 1 over the first ENTRY_RAMP_FRACTION of
               the travel span, driven by the note's own position. */
            const entryRampPx = spanPx * ENTRY_RAMP_FRACTION
            const entryProgress = Math.min(Math.max((widthPx - leftPx) / entryRampPx, 0), 1)
            const entryEase = Math.pow(entryProgress, ENTRY_EASE)

            /* Played-region fade: the whole note becomes translucent exactly at the
               crossing (the moment sound happens) and deepens leftward, flooring at
               PLAYED_MIN_OPACITY — notes keep sliding out rather than vanishing. */
            const playedProgress = Math.min(Math.max((playheadPx - leftPx) / playheadPx, 0), 1)
            const playedOpacity =
              playedProgress === 0
                ? 1
                : PRESSED_OPACITY -
                  (PRESSED_OPACITY - PLAYED_MIN_OPACITY) * Math.pow(playedProgress, 0.7)

            /* The pulse: 0 before the crossing (the note is still travelling),
               1 exactly at it, held while the sound plays, then settling back
               to 0 — see lib/pulse.ts. No timer of its own, same rAF frame. */
            const elapsedSinceCrossing = now - (note.arrivedMs + TRAVEL_MS)
            const pulse = playedPulse(elapsedSinceCrossing, note.durationMs)
            const scale = 1 + PLAYED_SCALE * pulse
            const fillAlpha = lane.accidental
              ? ACCIDENTAL_FILL_ALPHA + PLAYED_FILL_BOOST_ACCIDENTAL * pulse
              : NATURAL_FILL_ALPHA + PLAYED_FILL_BOOST_NATURAL * pulse

            const inset = lane.accidental ? ACCIDENTAL_INSET : NATURAL_INSET
            const topPct = lane.topPct + lane.heightPct * inset
            const heightPct = lane.heightPct * (1 - 2 * inset)
            const isHighlighted = note.id === highlightedId
            return (
              <div
                key={note.id}
                className={`pointer-events-none rounded-sm ${
                  isHighlighted ? 'ring-2 ring-playhead' : ''
                }`}
                style={{
                  position: 'absolute',
                  top: `${topPct}%`,
                  width: `${noteWidthPx.toFixed(1)}px`,
                  height: `${heightPct}%`,
                  transform: `translate3d(${leftPx.toFixed(1)}px, 0, 0) scale(${scale.toFixed(3)})`,
                  willChange: 'transform, opacity',
                  opacity: (entryEase * playedOpacity).toFixed(3),
                  backgroundColor: `rgba(${lane.accidental ? ACCIDENTAL_RGB : NATURAL_RGB}, ${fillAlpha.toFixed(3)})`,
                  border: `${(1.5 + PLAYED_BORDER_EXTRA_PX * pulse).toFixed(2)}px solid ${
                    lane.accidental ? ACCIDENTAL_BORDER : NATURAL_BORDER
                  }`,
                  borderRadius: NOTE_RADIUS,
                }}
              />
            )
          })}
    </div>
  )
}
