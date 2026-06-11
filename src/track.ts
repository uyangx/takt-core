import { buildPayload, type TrackOptions } from './payload'
import { getConfig } from './state'
import { isBlocked } from './privacy'
import { send } from './transport'

function emit(name: string, opts?: TrackOptions): void {
  const cfg = getConfig()
  if (!cfg) return
  if (isBlocked(cfg)) return
  send(cfg.endpoint, buildPayload(name, cfg.domain, opts))
}

export function track(name: string, opts?: TrackOptions): void {
  if (typeof name !== 'string') return
  const trimmed = name.trim()
  if (trimmed === '' || trimmed === 'pageview') return
  emit(trimmed, opts)
}

export function pageview(): void {
  emit('pageview')
}
