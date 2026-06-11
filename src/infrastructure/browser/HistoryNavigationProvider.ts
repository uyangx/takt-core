import type { NavigationProvider } from '../../application/ports/NavigationProvider'

export class HistoryNavigationProvider implements NavigationProvider {
  onNavigate(cb: () => void): () => void {
    const originalPush = history.pushState

    const patchedPush: typeof history.pushState = function (
      this: History,
      ...args: Parameters<History['pushState']>
    ) {
      const result = originalPush.apply(this, args)
      cb()
      return result
    }
    history.pushState = patchedPush

    const onPopState = () => cb()
    window.addEventListener('popstate', onPopState)

    return () => {
      // Restore original pushState only if still pointing to our patch
      if (history.pushState === patchedPush) {
        history.pushState = originalPush
      }
      window.removeEventListener('popstate', onPopState)
    }
  }
}
