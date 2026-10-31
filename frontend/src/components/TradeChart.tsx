import { useId, useState } from 'react'
import type { CSSProperties } from 'react'
import type { SeriesPoint } from '../types/view'

export interface TradeChartProps {
  series: SeriesPoint[]
}

const VIEW_W = 500
const VIEW_H = 200
const PAD_X = 18
const PAD_TOP = 30
const PAD_BOTTOM = 30
const NODE_SIZE = 7
const HIT_SIZE = 22
const RING_SIZE = 14
const DOMAIN_PADDING = 0.08

const priceFormat = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 })

const cornerLabel =
  'pointer-events-none absolute font-mono text-[9px] tracking-[0.12em] text-slate-400 uppercase'

function formatDelta(deltaPct: number | null) {
  if (deltaPct === null) return '—'
  const sign = deltaPct > 0 ? '+' : deltaPct < 0 ? '−' : '±'
  return `${sign}${Math.abs(deltaPct).toFixed(2)}%`
}

function computeDomain(prices: number[]) {
  let low = Math.min(...prices)
  let high = Math.max(...prices)
  if (high === low) {
    const half = Math.max(Math.abs(high) * 0.0005, 0.5)
    low -= half
    high += half
  }
  const pad = (high - low) * DOMAIN_PADDING
  return { min: low - pad, max: high + pad }
}

function tooltipStyle(xPct: number, yPct: number): CSSProperties {
  const shiftX = xPct < 18 ? '-12px' : xPct > 82 ? 'calc(-100% + 12px)' : '-50%'
  return {
    left: `${xPct}%`,
    top: `${yPct}%`,
    transform: `translate(${shiftX}, calc(-100% - 10px))`,
  }
}

export function TradeChart({ series }: TradeChartProps) {
  const tooltipId = useId()
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  if (series.length === 0) {
    return (
      <div className="flex aspect-5/2 w-full items-center justify-center border border-slate-200 bg-sand-50">
        <p className="text-[11px] text-slate-500">Waiting for data…</p>
      </div>
    )
  }

  const prices = series.map((point) => point.price)
  const domain = computeDomain(prices)
  const plotBottom = VIEW_H - PAD_BOTTOM
  const plotHeight = plotBottom - PAD_TOP
  const stepX = series.length > 1 ? (VIEW_W - PAD_X * 2) / (series.length - 1) : 0

  const points = series.map((point, index) => ({
    point,
    x: series.length > 1 ? PAD_X + index * stepX : VIEW_W / 2,
    y: PAD_TOP + (1 - (point.price - domain.min) / (domain.max - domain.min)) * plotHeight,
  }))

  const linePath = points.map(({ x, y }, i) => `${i === 0 ? 'M' : 'L'}${x} ${y}`).join(' ')
  const first = points[0]
  const last = points[points.length - 1]
  const areaPath = `${linePath} L${last.x} ${plotBottom} L${first.x} ${plotBottom} Z`
  const active = activeIndex === null ? null : points[activeIndex]

  return (
    <figure className="m-0 flex flex-col gap-2">
      <div
        className="relative aspect-[5/2] w-full border border-slate-200 bg-sand-50"
        onMouseLeave={() => setActiveIndex(null)}
      >
        <span className={`${cornerLabel} top-1.5 left-2`}>
          {priceFormat.format(Math.max(...prices))} USD
        </span>
        <span className={`${cornerLabel} top-1.5 right-2`}>High</span>
        <span className={`${cornerLabel} bottom-1.5 left-2`}>
          {priceFormat.format(Math.min(...prices))} USD
        </span>
        <span className={`${cornerLabel} right-2 bottom-1.5`}>Low</span>

        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          role="group"
          aria-label={`Price series, ${series.length} points`}
          className="absolute inset-0 size-full overflow-visible"
        >
          <path d={areaPath} className="fill-playhead/[0.06]" />
          <path
            d={linePath}
            fill="none"
            strokeWidth={1.25}
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            className="stroke-ink"
          />

          {active ? (
            <line
              x1={active.x}
              x2={active.x}
              y1={PAD_TOP - 12}
              y2={plotBottom + 12}
              strokeWidth={1}
              strokeDasharray="3 3"
              vectorEffect="non-scaling-stroke"
              className="stroke-playhead/60"
            />
          ) : null}

          {points.map(({ point, x, y }, index) => {
            const isActive = index === activeIndex
            return (
              <g
                key={point.id}
                tabIndex={0}
                role="img"
                aria-label={`${priceFormat.format(point.price)} USD, ${formatDelta(
                  point.deltaPct,
                )}, ${point.note}`}
                aria-describedby={isActive ? tooltipId : undefined}
                onMouseEnter={() => setActiveIndex(index)}
                onFocus={() => setActiveIndex(index)}
                onBlur={() => setActiveIndex((current) => (current === index ? null : current))}
                className="group cursor-default outline-none"
              >
                <rect
                  x={x - HIT_SIZE / 2}
                  y={y - HIT_SIZE / 2}
                  width={HIT_SIZE}
                  height={HIT_SIZE}
                  fill="transparent"
                />
                <rect
                  x={x - RING_SIZE / 2}
                  y={y - RING_SIZE / 2}
                  width={RING_SIZE}
                  height={RING_SIZE}
                  fill="none"
                  strokeWidth={1.5}
                  vectorEffect="non-scaling-stroke"
                  className="stroke-playhead opacity-0 group-focus-visible:opacity-100"
                />
                <rect
                  x={x - NODE_SIZE / 2}
                  y={y - NODE_SIZE / 2}
                  width={NODE_SIZE}
                  height={NODE_SIZE}
                  className={isActive ? 'fill-playhead' : 'fill-ink'}
                />
              </g>
            )
          })}
        </svg>

        {active ? (
          <div
            id={tooltipId}
            role="tooltip"
            style={tooltipStyle((active.x / VIEW_W) * 100, (active.y / VIEW_H) * 100)}
            className="pointer-events-none absolute z-10 flex items-baseline gap-1.5 bg-ink px-2
              py-1 font-mono text-[10px] whitespace-nowrap text-white tabular-nums"
          >
            <span className="font-semibold text-trigger">
              {priceFormat.format(active.point.price)}
            </span>
            <span>{active.point.note}</span>
            <span className="text-slate-300">({formatDelta(active.point.deltaPct)})</span>
          </div>
        ) : null}
      </div>
      <figcaption className="text-[11px] text-slate-500">Hover a node for its price.</figcaption>
    </figure>
  )
}
