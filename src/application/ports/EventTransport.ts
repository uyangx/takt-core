import type { Payload } from '../../domain/event/Payload'

export interface EventTransport {
  send(payload: Payload): void
}
