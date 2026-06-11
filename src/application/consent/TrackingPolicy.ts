import type { ConsentStore } from '../ports/ConsentStore'
import type { DoNotTrackProvider } from '../ports/DoNotTrackProvider'
import type { EnvironmentProvider } from '../ports/EnvironmentProvider'

export interface TrackingPolicyConfig {
  respectDnt: boolean
  excludeLocalhost: boolean
  sampleRate: number
}

// Frozen short-circuit order: opt-out → DNT → localhost → sampling.
export class TrackingPolicy {
  constructor(
    private readonly consent: ConsentStore,
    private readonly dnt: DoNotTrackProvider,
    private readonly env: EnvironmentProvider,
    private readonly config: TrackingPolicyConfig,
    private readonly random: () => number = Math.random,
  ) {}

  isBlocked(): boolean {
    if (this.consent.isOptedOut()) return true
    if (this.config.respectDnt && this.dnt.isEnabled()) return true
    if (this.config.excludeLocalhost && this.isLocalhost(this.env.hostname())) return true
    if (this.config.sampleRate < 1 && this.random() >= this.config.sampleRate) return true
    return false
  }

  private isLocalhost(h: string): boolean {
    return (
      h === 'localhost' ||
      h === '::1' ||
      h === '0.0.0.0' ||
      h.endsWith('.local') ||
      /^127\.|^10\.|^192\.168\.|^172\.(1[6-9]|2\d|3[01])\./.test(h)
    )
  }
}
