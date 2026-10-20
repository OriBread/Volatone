# 4. The backend decides notes; the browser produces sound

Status: accepted

## Context
Audio must be synthesised in the browser (Web Audio). But the musical logic is the intellectual core of the project and should be testable, loggable and replayable.

## Decision
The backend engine turns ticks into `NoteEvent` messages (pitch, velocity, duration). The browser (Tone.js) only renders them as sound and visuals.

## Consequences
Every listener hears the same thing, and a session can be logged and replayed. Latency between feed and sound includes one network hop. The 'NoteEvent' schema becomes a contract that must be kept in sync on both sides.
