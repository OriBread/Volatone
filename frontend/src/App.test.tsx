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

  it('renders the product name and tagline', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: 'Volatone' })).toBeInTheDocument()
    expect(screen.getByText('Sonifying live market data')).toBeInTheDocument()
  })

  it('offers audio and shows the visualisation while waiting for data', () => {
    render(<App />)
    expect(screen.getByRole('button', { name: 'Enable audio' })).toBeInTheDocument()
    expect(screen.getByLabelText('Visualisation')).toHaveTextContent('Waiting for data...')
  })
})
