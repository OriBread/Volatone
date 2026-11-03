import { useEffect, useRef, useState } from 'react'

import { parseTickAndNote } from '../lib/parse'
import type { TickAndNote } from '../types/events'

export type ConnectionStatus = 'connecting' | 'open' | 'reconnecting'
export type StreamEvent = TickAndNote & { id: number; arrivedAt: number }

export interface StreamState {
  status: ConnectionStatus
  latest: StreamEvent | null
  events: StreamEvent[] // the most recent MAX_EVENTS, oldest first
}

const MAX_EVENTS = 25
const BASE_DELAY_MS = 500
const MAX_DELAY_MS = 15_000

/**
 * Keep a WebSocket open to `url` and expose what it receives.
 * `onEvent` runs once per message, straight from the socket, independent of React renders:
 * use it for things that must not miss a message (e.g. playing a sound).
 */
export function useVolatoneStream(
  url: string,
  onEvent?: (event: StreamEvent) => void,
): StreamState {
  const [state, setState] = useState<StreamState>({
    status: 'connecting',
    latest: null,
    events: [],
  })

  // Call the newest callback without re-opening the socket when it changes: the
  // effect below depends only on `url`, so a fresh onEvent would otherwise stay
  // trapped in the closure of the connection's first render.
  const onEventRef = useRef(onEvent)
  useEffect(() => {
    onEventRef.current = onEvent
  })

  // Unique per event — used as React keys and to link a chart node to its note.
  const nextId = useRef(0)

  useEffect(() => {
    let socket: WebSocket | null = null
    let retryTimer: ReturnType<typeof setTimeout> | undefined
    let attempt = 0
    let disposed = false // set by cleanup: tells onclose NOT to reconnect

    const connect = () => {
      socket = new WebSocket(url)

      socket.onopen = () => {
        attempt = 0 // a successful connection resets the backoff
        setState((s) => ({ ...s, status: 'open' }))
      }

      socket.onmessage = (message) => {
        if (typeof message.data !== 'string') return
        const event = parseTickAndNote(message.data)
        if (event === null) return // not ours: ignore, don't crash
        const stamped: StreamEvent = {
          ...event,
          id: nextId.current++,
          arrivedAt: performance.now(),
        }
        onEventRef.current?.(stamped) // run the latest callback
        setState((s) => ({
          ...s,
          latest: stamped,
          events: [...s.events, stamped].slice(-MAX_EVENTS),
        }))
      }

      socket.onclose = () => {
        if (disposed) return
        setState((s) => ({ ...s, status: 'reconnecting' }))
        const ceiling = Math.min(MAX_DELAY_MS, BASE_DELAY_MS * 2 ** attempt)
        retryTimer = setTimeout(connect, ceiling * (0.5 + Math.random() / 2))
        attempt++
      }
    }

    connect()

    return () => {
      disposed = true
      clearTimeout(retryTimer) // cancel any pending reconnect attempt
      socket?.close() // triggers onclose, but disposed prevents a reconnect
    }
  }, [url])

  return state
}

// TODO: Wipe out event history (setState) when switching URLs in the future so that it doesn't show old events from previous stream. Note for if/when different streams are supported.
