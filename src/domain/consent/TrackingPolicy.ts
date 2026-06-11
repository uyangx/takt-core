import type { ConsentStore } from '../../application/ports/ConsentStore'
import type { DoNotTrackProvider } from '../../application/ports/DoNotTrackProvider'
import type { EnvironmentProvider } from '../../application/ports/EnvironmentProvider'

export interface TrackingPolicyConfig {
  respectDnt: boolean
  excludeLocalhost: boolean
}

/** Domain service: encodes the frozen short-circuit order for blocking tracking.
 *  Order: opt-out → DNT → localhost.
 *  Depends on port interfaces only — never on concrete localStorage/navigator. */
export class TrackingPolicy {
  constructor(
    private readonly consent: ConsentStore,
    private readonly dnt: DoNotTrackProvider,
    private readonly env: EnvironmentProvider,
    private readonly config: TrackingPolicyConfig,
  ) {}

  /** Returns true when tracking must be suppressed. */
  isBlocked(): boolean {
    if (this.consent.isOptedOut()) return true
    if (this.config.respectDnt && this.dnt.isEnabled()) return true
    if (this.config.excludeLocalhost && this.isLocalhost(this.env.hostname())) return true
    return false
  }

  private isLocalhost(h: string): boolean {
    return (
      h === 'localhost' ||
      h === '::1' ||
      h.endsWith('.local') ||
      /^127\.|^10\.|^192\.168\.|^172\.(1[6-9]|2\d|3[01])\./.test(h)
    )
  }
}
