import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { SIDEBAR_DETAIL_PX, SIDEBAR_DETAIL_THRESHOLD_PX, SIDEBAR_MIN_PX } from '../lib/layout'
import { useSidebarLayout } from './useSidebarLayout'

describe('useSidebarLayout', () => {
  it('starts as a minimum-width overview', () => {
    const { result } = renderHook(() => useSidebarLayout())
    expect(result.current.widthPx).toBe(SIDEBAR_MIN_PX)
    expect(result.current.mode).toBe('overview')
    expect(result.current.dragging).toBe(false)
  })

  it('toggling widens to the detail width and back', () => {
    const { result } = renderHook(() => useSidebarLayout())

    act(() => result.current.toggleMode())
    expect(result.current.widthPx).toBe(SIDEBAR_DETAIL_PX)
    expect(result.current.mode).toBe('detail')

    act(() => result.current.toggleMode())
    expect(result.current.widthPx).toBe(SIDEBAR_MIN_PX)
    expect(result.current.mode).toBe('overview')
  })

  it('derives the mode from a dragged width', () => {
    const { result } = renderHook(() => useSidebarLayout())

    act(() => result.current.setWidthPx(SIDEBAR_DETAIL_THRESHOLD_PX - 1))
    expect(result.current.mode).toBe('overview')

    act(() => result.current.setWidthPx(SIDEBAR_DETAIL_THRESHOLD_PX))
    expect(result.current.mode).toBe('detail')
  })

  it('collapses from a dragged-open width when toggled', () => {
    const { result } = renderHook(() => useSidebarLayout())
    act(() => result.current.setWidthPx(500))
    act(() => result.current.toggleMode())
    expect(result.current.widthPx).toBe(SIDEBAR_MIN_PX)
  })

  it('tracks dragging', () => {
    const { result } = renderHook(() => useSidebarLayout())
    act(() => result.current.setDragging(true))
    expect(result.current.dragging).toBe(true)
  })
})
