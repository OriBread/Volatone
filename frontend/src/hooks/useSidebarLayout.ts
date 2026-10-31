import { useCallback, useState } from 'react'

import {
  SIDEBAR_DETAIL_PX,
  SIDEBAR_DETAIL_THRESHOLD_PX,
  SIDEBAR_MIN_PX,
  type SidebarMode,
} from '../lib/layout'

/**
 * Owns the sidebar's layout state.
 *
 * One source of truth for the 'width' and 'mode' of the sidebar via 'widthPx'. The mode is *derived* from it on every render, so they cannot drift apart.
 * Dragging past the threshold flips the mode; clicking the chevron just jumps the width to one of two presets.
 */
export function useSidebarLayout() {
  const [widthPx, setWidthPx] = useState(SIDEBAR_MIN_PX)
  const [dragging, setDragging] = useState(false)

  const mode: SidebarMode = widthPx >= SIDEBAR_DETAIL_THRESHOLD_PX ? 'detail' : 'overview'

  const toggleMode = useCallback(() => {
    setWidthPx((width) =>
      width >= SIDEBAR_DETAIL_THRESHOLD_PX ? SIDEBAR_MIN_PX : SIDEBAR_DETAIL_PX,
    )
  }, [])

  return { widthPx, mode, dragging, setWidthPx, setDragging, toggleMode }
}
