import type { StreamEvent } from '../hooks/useVolatoneStream'
import type { MetricRow } from '../types/view'

/**
 * Core-engine metrics:
 *  - one entry in METRICS == one row in MetricsPanel
 *  - all values are null for now (until the backend sends them)
 *  - adding a real metric = write a compute function, append one entry
 */

interface MetricDefinition {
  id: string
  label: string
  kind: 'number' | 'text' | 'meter'
  unit?: string
  hint?: string
  /** Only for trivially derivable client-side figures, if ever wanted. Null today. */
  compute: (events: readonly StreamEvent[]) => number | string | null
}

const METRICS: MetricDefinition[] = [
  // Values are null/placeholder today
  { id: 'scale', label: 'Scale', kind: 'text', compute: () => null },
  { id: 'nps', label: 'Notes / sec', kind: 'number', compute: () => null },
  { id: 'spread', label: 'Pitch spread', kind: 'number', unit: 'st', compute: () => null },
  // {
  //   id: 'stability',
  //   label: 'Tonality stability',
  //   kind: 'meter',
  //   hint: 'Not computed yet',
  //   compute: () => null,
  // },
]

export function buildMetrics(events: readonly StreamEvent[]): MetricRow[] {
  return METRICS.map((definition) => {
    const value = definition.compute(events)
    if (definition.kind === 'text') {
      return {
        kind: 'text',
        id: definition.id,
        label: definition.label,
        value: typeof value === 'string' ? value : null,
        hint: definition.hint,
      }
    }
    return {
      kind: definition.kind,
      id: definition.id,
      label: definition.label,
      value: typeof value === 'number' ? value : null,
      unit: definition.unit,
      hint: definition.hint,
    }
  })
}
