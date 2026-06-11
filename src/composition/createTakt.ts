import { Analytics } from '../application/Analytics'
import type { AnalyticsConfig } from '../application/Analytics'
import { ResilientTransport } from '../infrastructure/transport/ResilientTransport'
import { LocalStorageConsentStore } from '../infrastructure/consent/LocalStorageConsentStore'
import { NavigatorDntProvider } from '../infrastructure/browser/NavigatorDntProvider'
import { WindowEnvironmentProvider } from '../infrastructure/browser/WindowEnvironmentProvider'
import { HistoryNavigationProvider } from '../infrastructure/browser/HistoryNavigationProvider'
import { DocumentClickSource } from '../infrastructure/browser/DocumentClickSource'
import createUrlScrubber, { type UrlScrubber } from '../domain/url/UrlScrubber'

export interface Config {
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
}

export function createTakt(config: Config = {}): Analytics {
  const resolvedConfig: AnalyticsConfig = {
    domain: config.domain || location.hostname,
    endpoint: config.endpoint ?? '/api/event',
    respectDnt: config.respectDnt ?? true,
    excludeLocalhost: config.excludeLocalhost ?? true,
    enabled: config.enabled ?? true,
    debug: config.debug ?? false,
    sampleRate: config.sampleRate ?? 1,
    scrubUrl: createUrlScrubber({
      trackQuery: config.trackQuery,
      queryParams: config.queryParams,
      custom: config.scrubUrl,
    }),
  }

  return new Analytics(
    resolvedConfig,
    new ResilientTransport(resolvedConfig.endpoint),
    new LocalStorageConsentStore(),
    new NavigatorDntProvider(),
    new WindowEnvironmentProvider(),
    new HistoryNavigationProvider(),
    new DocumentClickSource(),
  )
}
