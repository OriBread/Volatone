export type SidebarMode = 'overview' | 'detail'

/** Narrowest the sidebar can be; also the overview width. */
export const SIDEBAR_MIN_PX = 280
/** Widest the sidebar can be, as a percentage of the viewport width. */
export const SIDEBAR_MAX_VW = 40
/** Width the chevron opens the sidebar to. */
export const SIDEBAR_DETAIL_PX = 600
/** At or above this width the sidebar shows the detail view. */
export const SIDEBAR_DETAIL_THRESHOLD_PX = 400

/** Playhead position as a percentage of the roll's width. */
export const PLAYHEAD_X_PERCENT = 25

/** Time a note takes to travel from the right edge of the roll to the playhead. */
export const TRAVEL_MS = 4000

/* -- Roll pitch lanes ------------------------------------------------------------- */

/** Lowest lane of the roll, also the emphasis/reference pitch by default.
    One octave above the engine's former C3 base, matching its shifted scale.
    Changing this one constant re-tunes the whole octave. */
export const ROLL_OCTAVE_BASE = 'C4'

const PITCH_CLASSES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
const NATURAL_CLASSES = new Set(['C', 'D', 'E', 'F', 'G', 'A', 'B'])
/** Engine spellings are flattened (Eb3, Bb3): map them onto sharp lanes. */
const FLAT_TO_SHARP: Record<string, string> = { Db: 'C#', Eb: 'D#', Gb: 'F#', Ab: 'G#', Bb: 'A#' }

/** 'Eb3' -> 'D#3'. One canonical name per lane, whatever the engine sends.
    Octave splitting is regex-based (name vs digits), so two-digit (C10) and
    negative (C-1) octaves work too — the old last-char slice corrupted them. */
export function normalizePitch(pitch: string): string {
  const match = /^([A-G][#b]?)(-?\d+)$/.exec(pitch)
  if (match === null) return pitch // not a recognizable pitch: pass through; the lane lookup will miss
  return `${FLAT_TO_SHARP[match[1]] ?? match[1]}${match[2]}`
}

export interface LaneSpec {
  pitch: string
  accidental: boolean
  /** Top edge of the lane as % of roll height (0 = top). */
  topPct: number
  /** Lane height as % of roll height. */
  heightPct: number
}

/**
 * One full chromatic octave of lanes, top = highest pitch.
 *
 * Naturals take full lanes; accidentals are thinner rows centred on the boundary
 * between their flanking naturals (MIDI black-key language). The layout is
 * independent of which pitches the engine emits, so any scale still lands on a lane.
 */
export function rollOctaveLanes(base: string = ROLL_OCTAVE_BASE): LaneSpec[] {
  const root = normalizePitch(base)
  const rootIndex = PITCH_CLASSES.indexOf(root.slice(0, -1))
  if (rootIndex === -1) throw new Error(`rollOctaveLanes: unknown pitch "${base}"`)
  let octave = Number(root.slice(-1))

  const semitones: { pitch: string; accidental: boolean; naturalRow: number | null }[] = []
  let naturalCount = 0
  for (let i = 0; i < 12; i++) {
    const pitchClass = PITCH_CLASSES[(rootIndex + i) % 12]
    if (pitchClass === 'C' && i > 0) octave++
    const accidental = !NATURAL_CLASSES.has(pitchClass)
    semitones.push({
      pitch: `${pitchClass}${octave}`,
      accidental,
      naturalRow: accidental ? null : naturalCount++,
    })
  }

  const naturalHeight = 100 / naturalCount
  const accidentalHeight = naturalHeight * 0.5

  const lanes = semitones.map((semitone, index): LaneSpec => {
    if (semitone.naturalRow !== null) {
      const row = semitone.naturalRow
      return {
        pitch: semitone.pitch,
        accidental: false,
        topPct: (naturalCount - 1 - row) * naturalHeight,
        heightPct: naturalHeight,
      }
    }
    // The boundary between the flanking natural rows, from the top.
    let lowerRow = -1
    for (let i = index - 1; i >= 0; i--) {
      const row = semitones[i].naturalRow
      if (row !== null) {
        lowerRow = row
        break
      }
    }
    const boundary =
      lowerRow === -1 ? 0 : (naturalCount - 1 - lowerRow) * naturalHeight + naturalHeight
    return {
      pitch: semitone.pitch,
      accidental: true,
      topPct: Math.max(0, Math.min(boundary - accidentalHeight / 2, 100 - accidentalHeight)),
      heightPct: accidentalHeight,
    }
  })

  return lanes.sort((a, b) => a.topPct - b.topPct)
}

/** The roll's canonical lanes: computed once, shared by frame and notes layer. */
export const ROLL_LANES: LaneSpec[] = rollOctaveLanes()

export const LANE_BY_PITCH: ReadonlyMap<string, LaneSpec> = new Map(
  ROLL_LANES.map((lane) => [lane.pitch, lane]),
)
