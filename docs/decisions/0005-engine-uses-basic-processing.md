# 5. The backend engine (temporarily) utilises very basic processing logic on incoming tick data

Status: accepted

## Context
During the setup/MVP stages of this project where I need to ensure all the components work together robustly and cleanly, the actual mechanism for sonification is not a priority.

## Decision
core.py (where engine processing lives) uses a simple C minor Pentatonic mapping for producing notes when ingesting tick data. Only the relative difference between the previous and current price instance is used to influence the "qualities" of an outputted note. These include the pitch, velocity and duration of the note played. These are calculated using easily understandable metrics and are returned along with the corresonding price.

## Consequences
When fed with live-streamed data, interpreting if the engine logic is correctly working and what that effect is becomes easy to manage. Functionality is easy to replace and swap out, and the 3 "qualities" of the note can be used as scaffolding for when it comes time to make the frontend "metrics" module part of the dashboard for visualisation. Will eventually have to be superseded/archived.
