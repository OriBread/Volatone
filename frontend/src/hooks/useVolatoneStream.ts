import { useEffect, useRef, useState } from 'react'

import { parseTickAndNote } from '../lib/parse'
import type { TickAndNote } from '../types/events'

export type ConnectionStatus = 'connecting' | 'open' | 'reconnecting'

export interface StreamState {
  status: ConnectionStatus
  latest: TickAndNote | null
  events: TickAndNote[] // the most recent MAX_EVENTS, oldest first
}

const MAX_EVENTS = 200
const BASE_DELAY_MS = 500
const MAX_DELAY_MS = 15_000

/**
 * Keep a WebSocket open to `url` and expose what it receives.
 * `onEvent` runs once per message, straight from the socket, independent of React renders:
 * use it for things that must not miss a message (e.g. playing a sound).
 */
export function useVolatoneStream(
  url: string,
  onEvent?: (event: TickAndNote) => void,
): StreamState {
  const [state, setState] = useState<StreamState>({
    status: 'connecting',
    latest: null,
    events: [],
  })

  // Always call the newest callback without re-opening the socket when it changes.
  const onEventRef = useRef(onEvent)
  useEffect(() => {
    onEventRef.current = onEvent
  })

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
        onEventRef.current?.(event)
        setState((s) => ({
          ...s,
          latest: event,
          events: [...s.events, event].slice(-MAX_EVENTS),
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
      clearTimeout(retryTimer)
      socket?.close()
    }
  }, [url])

  return state
}
