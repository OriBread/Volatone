import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

afterEach(cleanup)

// jsdom has no ResizeObserver; NotesLayer measures its container with one.
// This stub keeps the callback shape so components still receive an initial size.
class ResizeObserverStub {
  callback: ResizeObserverCallback
  constructor(callback: ResizeObserverCallback) {
    this.callback = callback
  }
  observe(target: Element) {
    this.callback(
      [
        {
          target,
          contentRect: target.getBoundingClientRect(),
          borderBoxSize: [],
          contentBoxSize: [],
          devicePixelContentBoxSize: [],
        } as unknown as ResizeObserverEntry,
      ],
      this,
    )
  }
  disconnect() {}
  unobserve() {}
}
// Assigned directly (not vi.stubGlobal): test files call unstubAllGlobals() in their
// own afterEach, which would delete a stubGlobal and undo this between tests.
globalThis.ResizeObserver = ResizeObserverStub
