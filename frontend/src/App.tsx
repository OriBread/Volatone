import { useCallback, useMemo, useState } from 'react'

import { AppShell } from './components/AppShell'
import { Footer } from './components/Footer'
import { Header } from './components/Header'
import { LiveFeed } from './components/LiveFeed'
import { MetricsPanel } from './components/MetricsPanel'
import { NotesLayer } from './components/NotesLayer'
import { PianoRollFrame } from './components/PianoRollFrame'
import { Sidebar } from './components/Sidebar'
import { SidebarSection } from './components/SidebarSection'
import { TradeChart } from './components/TradeChart'
import { useSidebarLayout } from './hooks/useSidebarLayout'
import { useVolatoneStream } from './hooks/useVolatoneStream'
import { clampThresholdMs, createAudioEngine } from './lib/audio'
import { streamUrl } from './lib/config'
import { buildMetrics } from './lib/metrics'
import { TRAVEL_MS } from './lib/layout'
import { toFeedRows, toRollNotes, toSeries } from './lib/view'

/* Blank placeholders: endpoint TBD */
const PLACEHOLDER_TICKER = { symbol: '—', name: '', price: null }
const NO_SOURCE = { id: 'live', label: 'Live' }
const NOOP = () => {}

export default function App() {
  // Created once. Safe in render: nothing touches audio until start() is called.
  const [audio] = useState(createAudioEngine)
  const [audioOn, setAudioOn] = useState(false)
  // True while the AudioContext unlock is awaiting the browser, so the Sound
  // button can show a loading state until audio is genuinely live.
  const [audioPending, setAudioPending] = useState(false)
  const [highlightedId, setHighlightId] = useState<string | null>(null)
  const { widthPx, mode, dragging, setWidthPx, setDragging, toggleMode } = useSidebarLayout()

  // Sound fires on the audio clock exactly when the note crosses the playhead
  // (TRAVEL_MS after arrival; the engine corrects lookAhead + hardware latency).
  const { events } = useVolatoneStream(streamUrl(), (event) => {
    audio.schedule(event.note, TRAVEL_MS)
  })

  // Memoised on `events` so a silent stream re-renders nothing below
  const series = useMemo(() => toSeries(events), [events])
  const rollNotes = useMemo(() => toRollNotes(events), [events])
  const feedRows = useMemo(() => toFeedRows(events, 6), [events])
  const metrics = useMemo(() => buildMetrics(events), [events])

  const toggleAudio = async () => {
    if (audioOn) {
      audio.stop()
      setAudioOn(false)
    } else {
      setAudioPending(true)
      try {
        await audio.start() // called from a click, so browsers allow it
      } catch (error) {
        // Without this, a rejected unlock (autoplay policy mishap) becomes an
        // unhandled rejection and the button silently stops responding.
        console.error('Audio could not start:', error)
        return
      } finally {
        // Cleared whether start resolved or failed: the button must never
        // stay stuck in its loading state.
        setAudioPending(false)
      }
      // Backfill the mute window: while the sound was off, arriving notes were
      // scheduled against a null voice and silently dropped. Anything still en
      // route to the playhead can still sound — schedule each at exactly its
      // remaining transit (TRAVEL_MS minus what it already travelled), so every
      // note that crosses after this instant is audible, not just the ones that
      // arrive from here on.
      const now = performance.now()
      for (const event of events) {
        const remainingMs = TRAVEL_MS - (now - event.arrivedAt)
        if (remainingMs > clampThresholdMs()) {
          audio.schedule(event.note, remainingMs)
        }
      }
      setAudioOn(true)
    }
  }

  // Clicking the same node again clears the highlight
  const handleSelect = useCallback((id: string) => {
    setHighlightId((current) => (current === id ? null : id))
  }, [])

  return (
    <AppShell
      header={
        <Header
          ticker={PLACEHOLDER_TICKER}
          sources={[NO_SOURCE]}
          sourceId={NO_SOURCE.id}
          onSourceChange={NOOP}
          audioOn={audioOn}
          audioPending={audioPending}
          onToggleAudio={toggleAudio}
        />
      }
      sidebarWidthPx={widthPx}
      sidebarDragging={dragging}
      roll={
        <PianoRollFrame>
          <NotesLayer notes={rollNotes} highlightedId={highlightedId} />
        </PianoRollFrame>
      }
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
              <SidebarSection title="Metrics" rightLabel="core engine">
                <MetricsPanel rows={metrics} />
              </SidebarSection>
            </>
          ) : (
            <>
              <SidebarSection title="Trade chart" rightLabel="1s tick · realtime">
                <TradeChart series={series} selectedId={highlightedId} onSelect={handleSelect} />
              </SidebarSection>
              <SidebarSection title="Metrics" rightLabel="core engine">
                <MetricsPanel rows={metrics} />
              </SidebarSection>
            </>
          )}
        </Sidebar>
      }
      footer={
        <Footer
          linkedinUrl="https://www.linkedin.com/in/jomielle-de-sagun/"
          githubUrl="https://github.com/Oribread/"
        />
      }
    />
  )
}
