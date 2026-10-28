# 7. Backend implements single-stream broadcasting; Frontend uses one custom hook to get and parse data, and one component to draw said data

Status: accepted

## Context
For Volatone's MVP, when a client loads the webpage, the frontend should automatically setup a websocket connection to a real-time data stream. There is only one source data stream ws api to connect to, by default this connection begins on load, persists on the page and the socket is only able to be closed when the page is closed.


## Decision
The backend's connection manager is simple, putting any newly established ws channels onto a list. Messages sent to the clients originate from the background process (to be replaced with the API) triggering the connection manager to broadcast the new payload.

The frontend utilises a custom useVolatoneStream hook which sets up and manages the persistent connection with exponential fallback w/ jitter. This hook synchronises a callback with the incoming message which facilitates the tone played.

## Consequences
Straightforward and simple connection management system, easy to replace internal engine mechanics. However, in the future where I'd like to support multiplexing multiple data streams and clients accessing different data streams simultaneously, a different/extended architecture would need to be used to address the scaling bottleneck.

Frontend has direct coupling for these core components. The hotpath assumes a specific endpoint and payload structure which will have to be configured/replaced when we move to add more data streams.
