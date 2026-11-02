import type { FeedRow } from '../types/view'

export interface LiveFeedProps {
  rows: FeedRow[]
}

const priceFormat = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 })

const headCell = 'py-1.5 font-normal'

function DeltaCell({ deltaPct }: { deltaPct: number | null }) {
  if (deltaPct === null) return <span className="text-slate-400">—</span>

  const magnitude = Math.abs(deltaPct).toFixed(2)
  if (deltaPct === 0) return <span className="text-slate-500">{magnitude}%</span>

  const isUp = deltaPct > 0
  return (
    <span className={isUp ? 'text-amber-500' : 'text-blue-600'}>
      <span aria-hidden="true">{isUp ? '▲' : '▼'}</span>
      <span className="sr-only">{isUp ? 'up ' : 'down '}</span>
      {magnitude}%
    </span>
  )
}

export function LiveFeed({ rows }: LiveFeedProps) {
  return (
    <table className="w-full table-fixed border-collapse font-mono">
      <caption className="sr-only">Live feed, newest first</caption>
      <colgroup>
        <col className="w-[28%]" />
        <col className="w-[18%]" />
        <col className="w-[30%]" />
        <col className="w-[24%]" />
      </colgroup>
      <thead>
        <tr className="border-b border-slate-200 text-sm tracking-[0.16em] text-slate-500 uppercase">
          <th scope="col" className={`${headCell} text-left`}>
            Time
          </th>
          <th scope="col" className={`${headCell} text-center`}>
            Note
          </th>
          <th scope="col" className={`${headCell} text-right`}>
            Price
          </th>
          <th scope="col" className={`${headCell} text-right`}>
            <span aria-hidden="true">Δ</span>
            <span className="sr-only">Change per </span>
            Step
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 ? (
          <tr>
            <td colSpan={4} className="py-6 text-center font-sans text-sm text-slate-500">
              Waiting for data…
            </td>
          </tr>
        ) : (
          rows.map((row) => (
            <tr key={row.id} className="motion-safe:animate-feed-in">
              <td className="truncate py-2 text-sm font-semibold text-slate-500 tabular-nums">
                {row.time}
              </td>
              <td className="py-2 text-center font-display text-sm font-bold text-ink">
                {row.note}
              </td>
              <td className="py-2 text-right text-sm font-semibold text-slate-700 tabular-nums">
                {priceFormat.format(row.price)}
              </td>
              <td className="py-2 text-right text-sm font-semibold tabular-nums">
                <DeltaCell deltaPct={row.deltaPct} />
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  )
}
