import { useState } from 'react'

import { AppShell } from '../components/AppShell'
import { Footer } from '../components/Footer'
import { Header } from '../components/Header'
import { LiveFeed } from '../components/LiveFeed'
import { MetricsPanel } from '../components/MetricsPanel'
import { PianoRollFrame } from '../components/PianoRollFrame'
import { Sidebar } from '../components/Sidebar'
import { SidebarSection } from '../components/SidebarSection'
import { TradeChart } from '../components/TradeChart'
import { useSidebarLayout } from '../hooks/useSidebarLayout'
import type { FeedRow, MetricRow, SeriesPoint, SourceOption, TickerInfo } from '../types/view'

const ticker: TickerInfo = { symbol: 'BTC/USD', name: 'Bitcoin / US Dollar', price: 62342.5 }

const sources: SourceOption[] = [{ id: 'btc-usd', label: 'BTC/USD' }]

// Whole-tone lanes, top to bottom, with middle C emphasised.
const lanes = ['A#4', 'G#4', 'F#4', 'E4', 'D4', 'C4', 'A#3', 'G#3', 'F#3', 'E3', 'D3', 'C3']

// Sample notes use the engine's pentatonic set (C3 Eb3 F3 G3 Bb3).
const feedRows: FeedRow[] = [
  { id: 'f8', time: '21:04:14', note: 'Bb3', price: 62286, deltaPct: -0.01 },
  { id: 'f7', time: '21:04:13', note: 'G3', price: 62292, deltaPct: -0.05 },
  { id: 'f6', time: '21:04:13', note: 'Bb3', price: 62326, deltaPct: -0.02 },
  { id: 'f5', time: '21:04:12', note: 'F3', price: 62342, deltaPct: 0.01 },
  { id: 'f4', time: '21:04:12', note: 'G3', price: 62333, deltaPct: -0.02 },
  { id: 'f3', time: '21:04:11', note: 'Eb3', price: 62345, deltaPct: 0.07 },
  { id: 'f2', time: '21:04:11', note: 'Bb3', price: 62300, deltaPct: 0.04 },
  { id: 'f1', time: '21:04:10', note: 'C3', price: 62273, deltaPct: null },
]

const series: SeriesPoint[] = [
  { id: 's1', price: 62262, deltaPct: null, note: 'C3' },
  { id: 's2', price: 62273, deltaPct: 0.02, note: 'Eb3' },
  { id: 's3', price: 62300, deltaPct: 0.04, note: 'F3' },
  { id: 's4', price: 62292, deltaPct: -0.01, note: 'Eb3' },
  { id: 's5', price: 62318, deltaPct: 0.04, note: 'G3' },
  { id: 's6', price: 62306, deltaPct: -0.02, note: 'F3' },
  { id: 's7', price: 62333, deltaPct: 0.04, note: 'G3' },
  { id: 's8', price: 62345, deltaPct: 0.07, note: 'Bb3' },
  { id: 's9', price: 62342, deltaPct: -0.01, note: 'Bb3' },
]

// Placeholder metrics until the engine provides real ones.
const metrics: MetricRow[] = [
  { kind: 'text', id: 'scale', label: 'Scale', value: 'C Lydian' },
  { kind: 'number', id: 'nps', label: 'Notes / sec', value: 1.88 },
  { kind: 'number', id: 'spread', label: 'Pitch spread', value: 1.5, unit: 'st' },
  { kind: 'number', id: 'micro', label: 'Microtonal', value: 7, unit: '¢' },
  {
    kind: 'meter',
    id: 'stability',
    label: 'Tonality stability',
    value: 0.8,
    hint: 'Placeholder: not computed yet',
  },
]

export function Gallery() {
  const [sourceId, setSourceId] = useState(sources[0].id)
  const [audioOn, setAudioOn] = useState(false)
  const { widthPx, mode, dragging, setWidthPx, setDragging, toggleMode } = useSidebarLayout()

  return (
    <AppShell
      header={
        <Header
          ticker={ticker}
          sources={sources}
          sourceId={sourceId}
          onSourceChange={setSourceId}
          audioOn={audioOn}
          onToggleAudio={() => setAudioOn((on) => !on)}
        />
      }
      roll={<PianoRollFrame lanes={lanes} emphasisLane="C4" />}
      sidebarWidthPx={widthPx}
      sidebarDragging={dragging}
      sidebar={
        <Sidebar
          widthPx={widthPx}
          mode={mode}
          onWidthChange={setWidthPx}
          onToggleMode={toggleMode}
          onDraggingChange={setDragging}
        >
          {mode === 'overview' ? (
            <>
              <SidebarSection title="Live feed" rightLabel="streaming">
                <LiveFeed rows={feedRows} />
              </SidebarSection>
              <SidebarSection title="Metrics" rightLabel="placeholder">
                <MetricsPanel rows={metrics} />
              </SidebarSection>
            </>
          ) : (
            <>
              <SidebarSection title="Trade chart" rightLabel="1s tick · realtime">
                <TradeChart series={series} />
              </SidebarSection>
              <SidebarSection title="Metrics" rightLabel="placeholder">
                <MetricsPanel rows={metrics} />
              </SidebarSection>
            </>
          )}
        </Sidebar>
      }
      footer={<Footer linkedinUrl="https://www.linkedin.com/" githubUrl="https://github.com/" />}
    />
  )
}
