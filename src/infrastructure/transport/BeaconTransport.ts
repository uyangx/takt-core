import type { EventTransport } from '../../application/ports/EventTransport'
import type { Payload } from '../../domain/event/Payload'

export class BeaconTransport implements EventTransport {
  constructor(private readonly endpoint: string) {}

  send(payload: Payload): void {
    navigator.sendBeacon(this.endpoint, JSON.stringify(payload))
  }
}
