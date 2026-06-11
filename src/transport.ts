import type { Payload } from './payload'

export function send(endpoint: string, payload: Payload): void {
  const body = JSON.stringify(payload)
  try {
    if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
      navigator.sendBeacon(endpoint, body)
      return
    }
    if (typeof fetch === 'function') {
      void fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        keepalive: true,
      }).catch(() => {})
    }
  } catch {
    // best-effort: never surface transport errors to the host page
  }
}
