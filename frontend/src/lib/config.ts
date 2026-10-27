/**
 * WebSocket URL of the note stream.
 * Default: same origin as the page. In development the Vite proxy forwards /ws to the
 * backend; in production a reverse proxy or CDN can do the same.
 * Set VITE_WS_BASE_URL (e.g. wss://api.example.com) only if the frontend is hosted on a
 * different origin from the API.
 */
export function streamUrl(loc: Pick<Location, 'protocol' | 'host'> = window.location): string {
    const base = import.meta.env.VITE_WS_BASE_URL ?? `${loc.protocol === 'https:' ? 'wss:' : 'ws:'}//${loc.host}`
    return `${base}/ws/stream`
}
