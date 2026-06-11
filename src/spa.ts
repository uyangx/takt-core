import { pageview } from './track'

let installed = false

export function enableSpa(): void {
  if (installed) return
  installed = true
  const push = history.pushState
  if (typeof push === 'function') {
    history.pushState = function (this: History, ...args: Parameters<History['pushState']>) {
      const result = push.apply(this, args)
      pageview()
      return result
    }
    window.addEventListener('popstate', () => pageview())
  }
}
