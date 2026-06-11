import type { ClickSource } from '../ports/ClickSource'
import type { EnvironmentProvider } from '../ports/EnvironmentProvider'
import type { TrackOptions } from '../Analytics'

export class OutboundLinkTracker {
  constructor(
    private readonly clickSource: ClickSource,
    private readonly env: EnvironmentProvider,
    private readonly track: (name: string, opts?: TrackOptions) => void,
  ) {}

  enable(): () => void {
    return this.clickSource.onAnchorClick((a) => {
      if (!a.href) return
      let url: URL
      try { url = new URL(a.href) } catch { return }
      if (url.protocol !== 'http:' && url.protocol !== 'https:') return
      if (url.hostname === this.env.hostname()) return
      this.track('Outbound Link: Click', { props: { url: url.origin + url.pathname } })
    })
  }
}
