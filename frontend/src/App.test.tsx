import { render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import App from './App'
import { FakeWebSocket } from './test/fakeWebSocket'

describe('App', () => {
  beforeEach(() => {
    FakeWebSocket.instances = []
    vi.stubGlobal('WebSocket', FakeWebSocket)
  })
  afterEach(() => vi.unstubAllGlobals())

  it('opens the stream socket on mount and renders the ready-empty shell', () => {
    render(<App />)

    // Socket up: the root is live, not a mock. >0 (not ===1) because StrictMode
    // mounts effects twice in test.
    expect(FakeWebSocket.instances.length).toBeGreaterThan(0)

    // Shell present with nothing filled yet.
    expect(screen.getByRole('button', { name: 'Sound' })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Piano roll' })).toBeInTheDocument()
    // LiveFeed AND TradeChart both render "Waiting for data…" when empty, so use
    // getAllByText — a single getByText would fail on two matches.
    expect(screen.getAllByText('Waiting for data…').length).toBeGreaterThan(0)
  })

  it('renders the octave lanes before any data arrives', () => {
    render(<App />)
    // The roll paints its fixed octave (naturals + accidental in-between lanes) even
    // with zero events: check one natural and one accidental label directly.
    expect(screen.getByText('C4')).toBeInTheDocument()
    expect(screen.getByText('A#4')).toBeInTheDocument()
  })
})
