import type { EventTransport } from '../../application/ports/EventTransport'
import type { Payload } from '../../domain/event/Payload'

export class FetchTransport implements EventTransport {
  constructor(private readonly endpoint: string) {}

  send(payload: Payload): void {
    void fetch(this.endpoint, {
      method: 'POST',
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {})
  }
}
