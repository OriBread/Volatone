import type { ConnectionStatus } from '../hooks/useVolatoneStream'
import type { TickAndNote } from '../types/events'

/**
 * THE MOCKUP ENTRY POINT.
 *
 * body will be replaced with proper visualisation code atsp.
 * props are the contract between the data layer and the visuals
 *
 *  status  connection state, for a "live / reconnecting " indicator
 *  latest  the newet message, or null before the first one arrives
 *  events  recent messages, oldest first, for the piano roll
 *
 *  No sockets or audio is played here. Draw from props only.
 */
export interface VisualisationProps {
  status: ConnectionStatus
  latest: TickAndNote | null
  events: readonly TickAndNote[]
}

export function Visualisation({ status, latest, events }: VisualisationProps) {
  return (
    <section className="visualisation" aria-label="Visualisation">
      <p>
        status: <strong>{status}</strong> · {events.length} events
      </p>
      {latest ? (
        <p>
          price <strong>{latest.price.toFixed(2)}</strong> · note
          <strong>{latest.note.pitch}</strong> · velocity <strong>{latest.note.velocity}</strong> ·{' '}
          {latest.note.duration_ms} ms
        </p>
      ) : (
        <p>Waiting for data...</p>
      )}
    </section>
  )
}
