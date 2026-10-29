import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { FakeWebSocket } from '../test/fakeWebSocket'
import { useVolatoneStream } from './useVolatoneStream'

const message = JSON.stringify({
  type: 'tick_and_note',
  price: 100,
  note: { pitch: 'C3', velocity: 40, duration_ms: 500, timestamp_ms: 1 },
})

describe('useVolatoneStream', () => {
  beforeEach(() => {
    FakeWebSocket.instances = []
    vi.useFakeTimers()
    vi.stubGlobal('WebSocket', FakeWebSocket)
    vi.spyOn(Math, 'random').mockReturnValue(1) // no jitter: delay = full ceiling
  })
  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('reports open, stores messages and calls onEvent once per message', () => {
    const onEvent = vi.fn()
    const { result } = renderHook(() => useVolatoneStream('ws://x', onEvent))
    const socket = FakeWebSocket.instances[0]

    act(() => socket.open())
    expect(result.current.status).toBe('open')

    act(() => socket.message(message))
    expect(result.current.latest?.price).toBe(100)
    expect(result.current.events).toHaveLength(1)
    expect(onEvent).toHaveBeenCalledTimes(1)
  })

  it('ignores garbage instead of crashing', () => {
    const { result } = renderHook(() => useVolatoneStream('ws://x'))
    act(() => FakeWebSocket.instances[0].message('not json'))
    expect(result.current.events).toHaveLength(0)
  })

  it('reconnects with a growing delay after the connection drops', () => {
    const { result } = renderHook(() => useVolatoneStream('ws://x'))

    act(() => FakeWebSocket.instances[0].close())
    expect(result.current.status).toBe('reconnecting')
    act(() => vi.advanceTimersByTime(499))
    expect(FakeWebSocket.instances).toHaveLength(1) // first delay is 500 ms
    act(() => vi.advanceTimersByTime(1))
    expect(FakeWebSocket.instances).toHaveLength(2)

    act(() => FakeWebSocket.instances[1].close()) // failed again: delay doubles
    act(() => vi.advanceTimersByTime(999))
    expect(FakeWebSocket.instances).toHaveLength(2)
    act(() => vi.advanceTimersByTime(1))
    expect(FakeWebSocket.instances).toHaveLength(3)
  })

  it('does not reconnect after unmount', () => {
    const { unmount } = renderHook(() => useVolatoneStream('ws://x'))
    unmount() // cleanup closes the socket, which fires onclose
    act(() => vi.advanceTimersByTime(60_000))
    expect(FakeWebSocket.instances).toHaveLength(1)
  })
})
