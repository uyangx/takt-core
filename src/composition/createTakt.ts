import { Analytics } from '../application/Analytics'
import type { AnalyticsConfig } from '../application/Analytics'
import { ResilientTransport } from '../infrastructure/transport/ResilientTransport'
import { LocalStorageConsentStore } from '../infrastructure/consent/LocalStorageConsentStore'
import { NavigatorDntProvider } from '../infrastructure/browser/NavigatorDntProvider'
import { WindowEnvironmentProvider } from '../infrastructure/browser/WindowEnvironmentProvider'
import { HistoryNavigationProvider } from '../infrastructure/browser/HistoryNavigationProvider'
import { DocumentClickSource } from '../infrastructure/browser/DocumentClickSource'

export interface Config {
  domain?: string
  endpoint?: string
  respectDnt?: boolean
  excludeLocalhost?: boolean
}

/** Factory: wires concrete browser adapters and returns an Analytics instance. */
export function createTakt(config: Config = {}): Analytics {
  const resolvedConfig: AnalyticsConfig = {
    domain: config.domain || location.hostname,
    endpoint: config.endpoint ?? '/api/event',
    respectDnt: config.respectDnt ?? true,
    excludeLocalhost: config.excludeLocalhost ?? true,
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
