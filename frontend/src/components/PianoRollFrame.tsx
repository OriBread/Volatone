import type { CSSProperties, ReactNode } from 'react'
import { PLAYHEAD_X_PERCENT } from '../lib/layout'

export interface PianoRollFrameProps {
  lanes: string[]
  emphasisLane?: string
  children?: ReactNode
}

const LABEL_OFFSET: CSSProperties = { paddingLeft: 'calc(var(--playhead-x) + 8px)' }

export function PianoRollFrame({ lanes, emphasisLane, children }: PianoRollFrameProps) {
  // Exposed as a CSS variable so the notes layer can line up with the drawn playhead.
  const frameStyle = { '--playhead-x': `${PLAYHEAD_X_PERCENT}%` } as CSSProperties

  const gridStyle: CSSProperties = {
    gridTemplateRows: `repeat(${Math.max(lanes.length, 1)}, minmax(0, 1fr))`,
  }

  return (
    <figure className="m-0 flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden">
      <div
        style={frameStyle}
        className="piano-roll-bg relative min-h-0 flex-1 overflow-hidden rounded-sm border border-slate-200"
      >
        <ol aria-label="Pitch lanes" style={gridStyle} className="absolute inset-0 grid">
          {lanes.map((lane, index) => {
            const isEmphasis = lane === emphasisLane
            const isLast = index === lanes.length - 1
            return (
              <li
                key={`${lane}-${index}`}
                style={LABEL_OFFSET}
                className={`flex min-h-0 items-center ${
                  isLast ? '' : 'border-b border-slate-200/70'
                }`}
              >
                <span
                  className={`font-display text-sm leading-none font-bold tracking-[0.08em] ${
                    isEmphasis ? 'font-bold text-ink' : 'text-slate-500'
                  }`}
                >
                  {lane}
                  {isEmphasis ? <span className="sr-only"> (reference)</span> : null}
                </span>
              </li>
            )
          })}
        </ol>

        <div
          aria-hidden="true"
          className="playhead-glow-band pointer-events-none absolute inset-y-0 left-(--playhead-x) w-24
            -translate-x-1/2"
        />

        <div className="absolute inset-0">{children}</div>

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
