// Mirrors backend/src/volatone/schemas/events.py
export interface NoteEvent {
  pitch: string; // pitch notation, e.g. "C4"
  velocity: number; // 0 to 1
  duration_ms: number;
  timestamp_ms: number; // source tick time, Unix epoch ms
}
