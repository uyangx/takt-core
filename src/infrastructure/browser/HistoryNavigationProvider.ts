import type { NavigationProvider } from '../../application/ports/NavigationProvider'

export class HistoryNavigationProvider implements NavigationProvider {
  onNavigate(cb: () => void): () => void {
    const originalPush = history.pushState
    const originalReplace = history.replaceState

    const patch = <K extends 'pushState' | 'replaceState'>(original: History[K]): History[K] =>
      function (this: History, ...args: Parameters<History[K]>) {
        const result = original.apply(this, args)
        cb()
        return result
      } as History[K]

    const patchedPush = patch<'pushState'>(originalPush)
    const patchedReplace = patch<'replaceState'>(originalReplace)
    history.pushState = patchedPush
    history.replaceState = patchedReplace

    const onNav = () => cb()
    window.addEventListener('popstate', onNav)
    window.addEventListener('hashchange', onNav)

    return () => {
      if (history.pushState === patchedPush) history.pushState = originalPush
      if (history.replaceState === patchedReplace) history.replaceState = originalReplace
      window.removeEventListener('popstate', onNav)
      window.removeEventListener('hashchange', onNav)
    }
  }
}
