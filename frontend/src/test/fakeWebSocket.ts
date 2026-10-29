/** A stand-in for the browser's WebSocket that the test controls by hand. */
export class FakeWebSocket {
  static instances: FakeWebSocket[] = []

  onopen: (() => void) | null = null
  onmessage: ((event: { data: unknown }) => void) | null = null
  onclose: (() => void) | null = null

  constructor(public url: string) {
    FakeWebSocket.instances.push(this)
  }

  close() {
    this.onclose?.()
  }

  // helpers the test uses to play the server's part
  open() {
    this.onopen?.()
  }
  message(data: string) {
    this.onmessage?.({ data })
  }
}
