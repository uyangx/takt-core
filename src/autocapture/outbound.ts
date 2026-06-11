import { track } from '../track'

let installed = false

function findAnchor(target: EventTarget | null): HTMLAnchorElement | null {
  let el = target as HTMLElement | null
  while (el && el.tagName !== 'A') el = el.parentElement
  return el as HTMLAnchorElement | null
}

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
