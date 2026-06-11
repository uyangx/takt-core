import type { Payload } from './payload'

export function send(endpoint: string, payload: Payload): void {
  const body = JSON.stringify(payload)
  try {
    if (navigator.sendBeacon?.(endpoint, body)) {
      return
    }
    void fetch(endpoint, { method: 'POST', body, keepalive: true }).catch(() => {})
  } catch {
    // best-effort: never surface transport errors to the host page
  }
}
