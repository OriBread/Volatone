# 6. Backend uses an asynchronous server process to manage and broadcast data streams to multiple concurrent WebSocket clients simultaneously

Status: accepted

## Context
Volatone streams live market data sonification events from the backend engine to multiple browser clients simultaneously. I evaluated traditional thread-per-client synchronisation versus asynchronous concurrency models for managing persistent WebSocket connections.

## Decision
We will use Python's `asyncio` event loop and FastAPI's native asynchronous WebSockets to multiplex live data streams over a single-threaded cooperative runtime. A centralised connection manager (ws_manager.py) will handle broadcast loops and client disconnects asynchronously.

## Consequences
- **Positive:** Should expect massive concurrency efficiency; a single Uvicorn worker process can handle hundreds of simultaneous client WebSocket connections without thread context-switching overhead.
- **Positive:** Seamless integration with FastAPI's native async ecosystem.
- **Negative:** Heavy CPU-bound mathematical processing inside the streaming loop will block the single event loop; pure domain logic is separated so offloading is simple to maintain.
