import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// In dev, browser only talks to Vite server (:5173);
// Vite forwards API and WebSocket traffic to the backend (:8000).
// Avoids CORS in dev and mirrors how production will route everything under one origin.

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:8000',
      '/ws': { target: 'ws://localhost:8000', ws: true },
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
})
