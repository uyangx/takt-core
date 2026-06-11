import { createTakt } from './createTakt'
import type { Analytics, TrackOptions } from '../application/Analytics'
import type { UrlScrubber } from '../domain/url/UrlScrubber'

export { createTakt }
export type { Config } from './createTakt'
export type { TrackOptions } from '../application/Analytics'
export type { Payload } from '../domain/event/Payload'

export type Revenue = { amount: string; currency: string }

let _instance: Analytics | null = null
let _disposers: Array<() => void> = []

export interface InitOptions {
  domain?: string
  endpoint?: string
  respectDnt?: boolean
  excludeLocalhost?: boolean
  enabled?: boolean
  debug?: boolean
  sampleRate?: number
  trackQuery?: boolean
  queryParams?: string[]
  scrubUrl?: UrlScrubber
  auto?: boolean
  outbound?: boolean
  files?: boolean
  fileExtensions?: string[]
}

export function init(opts: InitOptions = {}): Analytics {
  _reset()

  _instance = createTakt({
    domain: opts.domain,
    endpoint: opts.endpoint,
    respectDnt: opts.respectDnt,
    excludeLocalhost: opts.excludeLocalhost,
    enabled: opts.enabled,
    debug: opts.debug,
    sampleRate: opts.sampleRate,
    trackQuery: opts.trackQuery,
    queryParams: opts.queryParams,
    scrubUrl: opts.scrubUrl,
  })

  if (opts.outbound) _disposers.push(_instance.enableOutbound())
  if (opts.files) _disposers.push(_instance.enableFiles(opts.fileExtensions))
  if (opts.auto !== false) {
    _disposers.push(_instance.enableSpa())
    _instance.pageview()
  }

  return _instance
}

export function track(name: string, opts?: TrackOptions): void {
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

export function _reset(): void {
  for (const dispose of _disposers) dispose()
  _disposers = []
  _instance = null
}
