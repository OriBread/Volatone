import { useId } from 'react'
import type { ReactNode } from 'react'

export interface SidebarSectionProps {
  title: string
  rightLabel?: string
  children: ReactNode
}

export function SidebarSection({ title, rightLabel, children }: SidebarSectionProps) {
  const headingId = useId()

  return (
    <section aria-labelledby={headingId} className="flex shrink-0 flex-col">
      <div className="flex items-baseline justify-between gap-3 border-b border-slate-200 pb-2">
        <h2
          id={headingId}
          className="font-mono text-base font-bold tracking-[0.16em] text-ink uppercase"
        >
          {title}
        </h2>
        {rightLabel ? (
          <span className="truncate font-mono text-sm font-semibold tracking-[0.08em] text-slate-500">
            {rightLabel}
          </span>
        ) : null}
      </div>
      <div className="pt-2">{children}</div>
    </section>
  )
}
