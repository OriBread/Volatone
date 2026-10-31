import { ChevronRight } from 'lucide-react'
import { useRef } from 'react'
import type { KeyboardEvent, PointerEvent, ReactNode } from 'react'
import { SIDEBAR_MAX_VW, SIDEBAR_MIN_PX } from '../lib/layout'
import type { SidebarMode } from '../lib/layout'

export interface SidebarProps {
  widthPx: number
  mode: SidebarMode
  onWidthChange: (px: number) => void
  onToggleMode: () => void
  /** Fires true when a drag actually starts moving, false when it ends. A plain click never fires. */
  onDraggingChange?: (dragging: boolean) => void
  children: ReactNode
}

const DRAG_THRESHOLD_PX = 3
const KEY_STEP_PX = 16

function maxWidthPx() {
  return Math.max(SIDEBAR_MIN_PX, Math.floor(window.innerWidth * (SIDEBAR_MAX_VW / 100)))
}

function clampWidth(px: number) {
  return Math.round(Math.min(Math.max(px, SIDEBAR_MIN_PX), maxWidthPx()))
}

interface DragState {
  pointerId: number
  startX: number
  startWidth: number
  moved: boolean
}

export function Sidebar({
  widthPx,
  mode,
  onWidthChange,
  onToggleMode,
  onDraggingChange,
  children,
}: SidebarProps) {
  const dragRef = useRef<DragState | null>(null)
  const isOverview = mode === 'overview'

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return
    event.currentTarget.setPointerCapture(event.pointerId)
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startWidth: widthPx,
      moved: false,
    }
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return
    const deltaX = drag.startX - event.clientX
    if (!drag.moved && Math.abs(deltaX) < DRAG_THRESHOLD_PX) return
    if (!drag.moved) onDraggingChange?.(true)
    drag.moved = true
    onWidthChange(clampWidth(drag.startWidth + deltaX))
  }

  function endDrag(event: PointerEvent<HTMLDivElement>, cancelled: boolean) {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return
    dragRef.current = null
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    if (drag.moved) onDraggingChange?.(false)
    else if (!cancelled) onToggleMode()
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const actions: Record<string, () => void> = {
      ArrowLeft: () => onWidthChange(clampWidth(widthPx + KEY_STEP_PX)),
      ArrowRight: () => onWidthChange(clampWidth(widthPx - KEY_STEP_PX)),
      Home: () => onWidthChange(SIDEBAR_MIN_PX),
      End: () => onWidthChange(maxWidthPx()),
      Enter: onToggleMode,
      ' ': onToggleMode,
    }
    const action = actions[event.key]
    if (!action) return
    event.preventDefault()
    action()
  }

  return (
    <div className="flex min-h-0 w-full flex-1">
      <div
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize panel. Click or press Enter to switch view"
        aria-valuemin={SIDEBAR_MIN_PX}
        aria-valuemax={typeof window === 'undefined' ? undefined : maxWidthPx()}
        aria-valuenow={widthPx}
        tabIndex={0}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={(event) => endDrag(event, false)}
        onPointerCancel={(event) => endDrag(event, true)}
        onKeyDown={handleKeyDown}
        className="group mr-2 flex w-4 shrink-0 cursor-col-resize touch-none items-center
          justify-center outline-none focus-visible:outline-2 focus-visible:outline-playhead"
      >
        <span aria-hidden="true" className="flex flex-col gap-1">
          {[0, 1, 2].map((dot) => (
            <span
              key={dot}
              className="size-0.5 bg-slate-300 transition-colors group-hover:bg-slate-500"
            />
          ))}
        </span>
      </div>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <div className="flex shrink-0 items-center justify-between gap-3 pb-1">
          <p className="flex items-center gap-2 font-mono text-sm font-bold tracking-[0.16em] text-slate-500 uppercase">
            {isOverview ? 'Overview' : 'Detail'}
            {isOverview ? null : (
              <span aria-hidden="true" className="size-1.5 rounded-full bg-indigo-600" />
            )}
          </p>
          <button
            type="button"
            aria-label={isOverview ? 'Expand to detail view' : 'Collapse to overview'}
            aria-expanded={!isOverview}
            onClick={onToggleMode}
            className="flex size-8 items-center justify-center rounded-full border border-slate-300
              bg-white text-slate-600 transition-colors hover:border-slate-400 hover:text-ink
              focus-visible:outline-2 focus-visible:outline-offset-2
              focus-visible:outline-playhead"
          >
            <ChevronRight
              aria-hidden="true"
              data-expanded={!isOverview}
              className="sidebar-toggle-icon size-4"
            />
          </button>
        </div>

        <div
          role="region"
          aria-label={isOverview ? 'Overview' : 'Detail'}
          tabIndex={0}
          className="min-h-0 flex-1 overflow-y-auto pt-6 pb-4 outline-none [scrollbar-width:none]
            focus-visible:outline-2 focus-visible:outline-playhead [&::-webkit-scrollbar]:hidden"
        >
          {/* Remounts on mode change so the new content fades in as the panel opens. */}
          <div key={mode} className="flex flex-col gap-6 motion-safe:animate-panel-in">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
