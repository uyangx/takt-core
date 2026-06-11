import { createTakt } from './createTakt'
import type { Analytics } from '../application/Analytics'

export { createTakt }
export type { Config } from './createTakt'
export type { TrackOptions } from '../application/Analytics'
export type { Payload } from '../domain/event/Payload'

// Re-export Revenue as a plain interface (not the class) for public API consumers
export type Revenue = { amount: string; currency: string }

let _instance: Analytics | null = null

export interface InitOptions {
  domain?: string
  endpoint?: string
  respectDnt?: boolean
  excludeLocalhost?: boolean
  auto?: boolean
  outbound?: boolean
  files?: boolean
  fileExtensions?: string[]
}

/** Create and store a default Analytics instance. Fires auto pageview by default. */
export function init(opts: InitOptions = {}): Analytics {
  _instance = createTakt({
    domain: opts.domain,
    endpoint: opts.endpoint,
    respectDnt: opts.respectDnt,
    excludeLocalhost: opts.excludeLocalhost,
  })

  if (opts.outbound) _instance.enableOutbound()
  if (opts.files) _instance.enableFiles(opts.fileExtensions)
  if (opts.auto !== false) {
    _instance.enableSpa()
    _instance.pageview()
  }

  return _instance
}

export function track(name: string, opts?: { props?: Record<string, string> }): void {
  _instance?.track(name, opts)
}

export function pageview(): void {
  _instance?.pageview()
}

export function optOut(): void {
  _instance?.optOut()
}

export function optIn(): void {
  _instance?.optIn()
}

/** Reset the default instance (used in tests). */
export function _reset(): void {
  _instance = null
}
