import type { CSSProperties, ReactNode } from 'react'
import { PLAYHEAD_X_PERCENT, ROLL_LANES } from '../lib/layout'

export interface PianoRollFrameProps {
  children?: ReactNode
}

const LABEL_OFFSET: CSSProperties = { paddingLeft: 'calc(var(--playhead-x) + 8px)' }

export function PianoRollFrame({ children }: PianoRollFrameProps) {
  // Exposed as a CSS variable so the notes layer can line up with the drawn playhead.
  const frameStyle = { '--playhead-x': `${PLAYHEAD_X_PERCENT}%` } as CSSProperties

  // The roll always draws a full chromatic octave (naturals as full lanes, accidentals
  // as thin in-between lanes), regardless of which pitches the engine emits — any
  // pitch the engine sends still lands on a lane.
  const naturals = ROLL_LANES.filter((lane) => !lane.accidental)
  const accidentals = ROLL_LANES.filter((lane) => lane.accidental)

  const gridStyle: CSSProperties = {
    gridTemplateRows: `repeat(${naturals.length}, minmax(0, 1fr))`,
  }

  return (
    <figure className="m-0 flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden">
      <div
        style={frameStyle}
        className="piano-roll-bg relative min-h-0 flex-1 overflow-hidden rounded-sm border border-slate-200"
      >
        <ol aria-label="Pitch lanes" style={gridStyle} className="absolute inset-0 grid">
          {naturals.map((lane, index) => {
            const isLast = index === naturals.length - 1
            return (
              <li
                key={lane.pitch}
                style={LABEL_OFFSET}
                className={`flex min-h-0 items-center ${
                  isLast ? '' : 'border-b border-slate-200/70'
                }`}
              >
                <span
                  className="font-display text-sm leading-none font-bold tracking-[0.08em]
                    text-slate-500"
                >
                  {lane.pitch}
                </span>
              </li>
            )
          })}
        </ol>

        {/* Accidentals: thin in-between rows over the natural-lane boundaries. */}
        {accidentals.map((lane) => (
          <div
            key={lane.pitch}
            style={{
              position: 'absolute',
              top: `${lane.topPct}%`,
              height: `${lane.heightPct}%`,
              ...LABEL_OFFSET,
            }}
            className="pointer-events-none flex items-center"
          >
            <span
              className="font-display text-[10px] leading-none font-bold tracking-[0.08em]
                text-slate-400"
            >
              {lane.pitch}
            </span>
          </div>
        ))}

        <div
          aria-hidden="true"
          className="playhead-glow-band pointer-events-none absolute inset-y-0 left-(--playhead-x) w-24
            -translate-x-1/2"
        />

        <div className="absolute inset-0 z-10">{children}</div>
        {/* Shade the played side of the roll; notes sit above it and use their own
            whole-note opacity change so they do not appear visually indented. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 w-(--playhead-x)"
          style={{
            background:
              'linear-gradient(to right, rgba(246, 244, 239, 0.8) 0%, rgba(246, 244, 239, 0.6) 45%, rgba(246, 244, 239, 0.42) 78%, rgba(246, 244, 239, 0.18) 100%)',
          }}
        />
        {/* Edge blends fade the roll into the page background instead of a hard line,
            so the instrument reads as part of the surface. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-6"
          style={{
            background:
              'linear-gradient(to bottom, rgba(246, 244, 239, 0.85) 0%, rgba(246, 244, 239, 0) 100%)',
          }}
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-(--playhead-x) border-l border-dashed
            border-playhead/80"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-1.5 left-(--playhead-x) -translate-x-full bg-playhead
            px-2 py-1 font-mono text-xs leading-none font-semibold text-white"
        >
          T0
        </span>

        <div aria-hidden="true" className="absolute inset-y-0 left-0 w-0.5 bg-slate-300" />
        <div aria-hidden="true" className="absolute inset-y-0 right-0 w-0.5 bg-slate-300" />
      </div>

      <figcaption className="shrink-0 pt-3 text-xs tracking-wide text-slate-500">
        Live datastream. Notes sound where they cross the dashed line.
      </figcaption>
    </figure>
  )
}
