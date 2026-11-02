import { ChevronDown, Loader2, Volume2, VolumeX } from 'lucide-react'
import type { SourceOption, TickerInfo } from '../types/view'

export interface HeaderProps {
  ticker: TickerInfo
  sources: SourceOption[]
  sourceId: string
  onSourceChange: (id: string) => void
  audioOn: boolean
  /** True between the click and the AudioContext actually resuming. */
  audioPending?: boolean
  onToggleAudio: () => void
}

const priceFormat = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const focusRing =
  'focus-visible:relative focus-visible:z-10 focus-visible:outline-2 ' +
  'focus-visible:outline-offset-2 focus-visible:outline-playhead'

export function Header({
  ticker,
  sources,
  sourceId,
  onSourceChange,
  audioOn,
  audioPending = false,
  onToggleAudio,
}: HeaderProps) {
  const priceText = ticker.price === null ? '—' : `$${priceFormat.format(ticker.price)}`
  const SoundIcon = audioPending ? Loader2 : audioOn ? Volume2 : VolumeX
  const SoundIconClasses = audioPending ? 'size-4 animate-spin' : 'size-4'

  return (
    <div className="flex w-full items-start justify-between gap-6">
      <div className="min-w-0">
        <p className="flex items-baseline gap-2.5 text-sm leading-none">
          <span className="font-mono tracking-[0.16em] text-slate-600 uppercase">Volatone</span>
          <span aria-hidden="true" className="text-slate-300">
            /
          </span>
          <span className="text-slate-400">Market Sonification</span>
        </p>
        <div className="mt-3 flex min-w-0 items-baseline gap-4">
          <h1 className="font-display text-5xl leading-none font-bold tracking-tight text-ink">
            {ticker.symbol}
          </h1>
          <p className="font-mono text-2xl leading-none text-ink tabular-nums">
            <span className="sr-only">Price </span>
            {priceText}
          </p>
          <p className="truncate text-sm text-slate-500">{ticker.name}</p>
        </div>
      </div>

      <div
        role="group"
        aria-label="Playback controls"
        className="mt-1 flex h-10 shrink-0 items-stretch border border-slate-300 bg-white text-sm"
      >
        <button
          type="button"
          aria-pressed={audioOn}
          aria-busy={audioPending || undefined}
          disabled={audioPending}
          onClick={onToggleAudio}
          className={`flex items-center gap-2 px-4 font-medium transition-colors ${focusRing} ${
            audioPending || audioOn ? 'bg-blue-50 text-playhead' : 'text-slate-700 hover:bg-sand-50'
          }`}
        >
          <SoundIcon aria-hidden="true" className={SoundIconClasses} strokeWidth={2} />
          Sound
        </button>

        <div className="relative flex items-stretch border-l border-slate-200">
          <select
            aria-label="Market source"
            value={sourceId}
            onChange={(event) => onSourceChange(event.target.value)}
            className={`cursor-pointer appearance-none bg-transparent pr-8 pl-3 font-medium
              text-slate-800 hover:bg-sand-50 ${focusRing}`}
          >
            {sources.map((source) => (
              <option key={source.id} value={source.id}>
                {source.label}
              </option>
            ))}
          </select>
          <ChevronDown
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2
              text-slate-500"
          />
        </div>

        <div role="group" aria-label="Data mode" className="flex items-stretch">
          <button
            type="button"
            aria-pressed="true"
            className={`flex items-center gap-2 bg-ink px-4 font-semibold text-white ${focusRing}`}
          >
            <span
              aria-hidden="true"
              className="size-2 rounded-full bg-trigger motion-safe:animate-pulse"
            />
            Live
          </button>
          <button
            type="button"
            aria-disabled="true"
            title="Coming soon"
            className={`cursor-not-allowed px-4 font-medium text-slate-400 ${focusRing}`}
          >
            Historical
          </button>
        </div>
      </div>
    </div>
  )
}
