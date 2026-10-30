export interface TickerInfo {
  symbol: string
  name: string
  price: number | null
}
export interface SourceOption {
  id: string
  label: string
}
export interface FeedRow {
  id: string
  time: string
  note: string
  price: number
  deltaPct: number | null
}
export interface SeriesPoint {
  id: string
  price: number
  deltaPct: number | null
  note: string
}
export interface RollNote {
  id: string
  pitch: string
  velocity: number
  durationMs: number
  timestampMs: number
}
export type MetricRow =
  | {
      kind: 'number'
      id: string
      label: string
      value: number | null
      unit?: string
      hint?: string
    }
  | { kind: 'text'; id: string; label: string; value: string | null; hint?: string }
  | { kind: 'meter'; id: string; label: string; value: number | null; hint?: string } // 0..1
