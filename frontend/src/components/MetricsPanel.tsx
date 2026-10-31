import type { MetricRow } from '../types/view'

export interface MetricsPanelProps {
  rows: MetricRow[]
}

const numberFormat = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 })

const valueClass = 'font-display text-xl leading-none font-semibold text-ink tabular-nums'

function formatNumber(value: number | null, unit?: string) {
  if (value === null) return '—'
  if (!unit) return numberFormat.format(value)
  const separator = /^[%¢°]/.test(unit) ? '' : ' '
  return `${numberFormat.format(value)}${separator}${unit}`
}

function MetricLabel({ label, hint }: { label: string; hint?: string }) {
  return (
    <dt
      title={hint}
      className="flex min-w-0 items-center gap-1.5 font-mono text-sm font-semibold tracking-[0.16em]
        text-slate-500 uppercase"
    >
      <span className="truncate">{label}</span>
      {hint ? (
        <>
          <span
            aria-hidden="true"
            className="flex size-3.5 shrink-0 cursor-help items-center justify-center rounded-full
              border border-slate-300 text-xs tracking-normal text-slate-400"
          >
            ?
          </span>
          <span className="sr-only">{`(${hint})`}</span>
        </>
      ) : null}
    </dt>
  )
}

function MeterRow({ row }: { row: Extract<MetricRow, { kind: 'meter' }> }) {
  const percent = row.value === null ? null : Math.round(Math.min(Math.max(row.value, 0), 1) * 100)

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 py-2">
      <MetricLabel label={row.label} hint={row.hint} />
      <dd className="contents">
        <span className="font-mono text-sm font-semibold text-ink tabular-nums">
          {percent === null ? '—' : `${percent}%`}
        </span>
        {percent === null ? (
          <span aria-hidden="true" className="col-span-2 h-1 w-full bg-slate-200" />
        ) : (
          <span
            role="meter"
            aria-label={row.label}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percent}
            className="col-span-2 block h-1 w-full bg-slate-200"
          >
            <span className="block h-full bg-indigo-600" style={{ width: `${percent}%` }} />
          </span>
        )}
      </dd>
    </div>
  )
}

export function MetricsPanel({ rows }: MetricsPanelProps) {
  return (
    <dl className="flex flex-col">
      {rows.map((row) => {
        if (row.kind === 'meter') return <MeterRow key={row.id} row={row} />

        const display =
          row.kind === 'number' ? formatNumber(row.value, row.unit) : (row.value ?? '—')

        return (
          <div key={row.id} className="flex items-center justify-between gap-4 py-2">
            <MetricLabel label={row.label} hint={row.hint} />
            <dd className={`shrink-0 ${valueClass}`}>{display}</dd>
          </div>
        )
      })}
    </dl>
  )
}

export function EmptyMetrics() {
  return <p className="py-6 text-center text-sm text-slate-500">No metrics yet</p>
}
