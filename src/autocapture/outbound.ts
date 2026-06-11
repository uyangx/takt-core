import { track } from '../track'
import { findAnchor } from './dom'

let installed = false

export function enableOutbound(): void {
  if (installed) return
  installed = true
  document.addEventListener(
    'click',
    (e) => {
      const a = findAnchor(e.target)
      if (!a || !a.href) return
      let url: URL
      try { url = new URL(a.href) } catch { return }
      if (url.hostname === location.hostname) return
      track('Outbound Link: Click', { props: { url: a.href } })
    },
    true,
  )
}
