import { EventName } from '../domain/event/EventName'
import { Props } from '../domain/event/Props'
import { Revenue } from '../domain/event/Revenue'
import { AnalyticsEvent } from '../domain/event/AnalyticsEvent'
import { buildPayload } from '../domain/event/Payload'
import { TrackingPolicy } from '../domain/consent/TrackingPolicy'
import type { EventTransport } from './ports/EventTransport'
import type { ConsentStore } from './ports/ConsentStore'
import type { DoNotTrackProvider } from './ports/DoNotTrackProvider'
import type { EnvironmentProvider } from './ports/EnvironmentProvider'
import type { NavigationProvider } from './ports/NavigationProvider'
import type { ClickSource } from './ports/ClickSource'
import { OutboundLinkTracker } from './autocapture/OutboundLinkTracker'
import { FileDownloadTracker } from './autocapture/FileDownloadTracker'
import { SpaPageviewTracker } from './autocapture/SpaPageviewTracker'

export interface TrackOptions {
  props?: Record<string, string>
  revenue?: { amount: string; currency: string }
}

export interface AnalyticsConfig {
  domain: string
  endpoint: string
  respectDnt: boolean
  excludeLocalhost: boolean
}

/** Application service: orchestrates tracking events through ports. */
export class Analytics {
  private readonly policy: TrackingPolicy

  constructor(
    private readonly config: AnalyticsConfig,
    private readonly transport: EventTransport,
    private readonly consent: ConsentStore,
    dnt: DoNotTrackProvider,
    private readonly envProvider: EnvironmentProvider,
    private readonly navProvider: NavigationProvider,
    private readonly clickSource: ClickSource,
  ) {
    this.policy = new TrackingPolicy(consent, dnt, envProvider, config)
  }

  track(name: string, opts?: TrackOptions): void {
    if (typeof name !== 'string') return
    let eventName: EventName
    try {
      eventName = new EventName(name)
    } catch {
      return
    }
    if (eventName.isReserved()) return
    this._emit(eventName, opts)
  }

  pageview(): void {
    this._emit(new EventName('pageview'))
  }

  optOut(): void {
    this.consent.optOut()
  }

  optIn(): void {
    this.consent.optIn()
  }

  /** Enables SPA pageview tracking. Returns a disposer. */
  enableSpa(): () => void {
    const tracker = new SpaPageviewTracker(this.navProvider, () => this.pageview())
    return tracker.enable()
  }

  /** Enables outbound link click tracking. Returns a disposer. */
  enableOutbound(): () => void {
    const tracker = new OutboundLinkTracker(this.clickSource, this.envProvider, (name, opts) =>
      this.track(name, opts),
    )
    return tracker.enable()
  }

  /** Enables file download tracking. Returns a disposer. */
  enableFiles(extensions?: string[]): () => void {
    const tracker = new FileDownloadTracker(this.clickSource, (name, opts) =>
      this.track(name, opts),
    extensions)
    return tracker.enable()
  }

  private _emit(name: EventName, opts?: TrackOptions): void {
    if (this.policy.isBlocked()) return
    const props = new Props(opts?.props)
    const revenue = opts?.revenue
      ? new Revenue(opts.revenue.amount, opts.revenue.currency)
      : undefined
    const event = new AnalyticsEvent(name, props, revenue)
    const payload = buildPayload(event, {
      domain: this.config.domain,
      url: this.envProvider.url(),
      referrer: this.envProvider.referrer(),
      width: this.envProvider.width(),
    })
    this.transport.send(payload)
  }
}
