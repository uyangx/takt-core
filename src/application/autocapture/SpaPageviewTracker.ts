import type { NavigationProvider } from '../ports/NavigationProvider'

/** Fires pageview() on each SPA navigation. */
export class SpaPageviewTracker {
  constructor(
    private readonly nav: NavigationProvider,
    private readonly pageview: () => void,
  ) {}

  enable(): () => void {
    return this.nav.onNavigate(() => this.pageview())
  }
}
