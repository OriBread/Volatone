import type { CSSProperties, ReactNode } from 'react'
import { SIDEBAR_MAX_VW, SIDEBAR_MIN_PX } from '../lib/layout'

export interface AppShellProps {
  header: ReactNode
  roll: ReactNode
  sidebar: ReactNode
  footer: ReactNode
  sidebarWidthPx: number
  /** True while the user drags the sidebar; turns the width transition off. */
  sidebarDragging?: boolean
  sidebarLabel?: string
}

export function AppShell({
  header,
  roll,
  sidebar,
  footer,
  sidebarWidthPx,
  sidebarDragging = false,
  sidebarLabel = 'Session panel',
}: AppShellProps) {
  // Two tracks: the roll takes what's left, the sidebar gets its (clamped) width.
  // transition on grid-template-columns (see .app-layout in index.css) animates both at once.
  const layoutStyle: CSSProperties = {
    gridTemplateColumns: `minmax(0, 1fr) clamp(${SIDEBAR_MIN_PX}px, ${sidebarWidthPx}px, ${SIDEBAR_MAX_VW}vw)`,
  }

  return (
    <div className="flex h-dvh min-w-0 flex-col overflow-hidden font-sans text-ink">
      <header className="flex shrink-0 px-8 pt-8 pb-4 2xl:px-12">{header}</header>

      <main
        style={layoutStyle}
        data-dragging={sidebarDragging}
        className="app-layout grid min-h-0 min-w-0 flex-1 gap-8 overflow-hidden px-8 py-4 2xl:px-12"
      >
        <section aria-label="Piano roll" className="flex min-h-0 min-w-0 flex-col py-4">
          {roll}
        </section>

        <aside
          aria-label={sidebarLabel}
          className="flex min-h-0 min-w-0 flex-col overflow-hidden pt-3"
        >
          {sidebar}
        </aside>
      </main>

      <footer className="shrink-0 px-8 pt-4 pb-8 2xl:px-12">{footer}</footer>
    </div>
  )
}
