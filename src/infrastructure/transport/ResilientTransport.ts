import type { EventTransport } from '../../application/ports/EventTransport'
import type { Payload } from '../../domain/event/Payload'

/** Tries sendBeacon first; falls back to fetch keepalive; never throws. */
export class ResilientTransport implements EventTransport {
  constructor(private readonly endpoint: string) {}

  send(payload: Payload): void {
    const body = JSON.stringify(payload)
    try {
      if (navigator.sendBeacon?.(this.endpoint, body)) return
      void fetch(this.endpoint, { method: 'POST', body, keepalive: true }).catch(() => {})
    } catch {
      // best-effort: never surface transport errors to the host page
    }
  }
}
