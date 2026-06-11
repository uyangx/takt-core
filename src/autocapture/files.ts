import { track } from '../track'
import { getConfig } from '../state'

let installed = false

function findAnchor(target: EventTarget | null): HTMLAnchorElement | null {
  let el = target as HTMLElement | null
  while (el && el.tagName !== 'A') el = el.parentElement
  return el as HTMLAnchorElement | null
}

export function enableFiles(): void {
  if (installed) return
  installed = true
  document.addEventListener(
    'click',
    (e) => {
      const cfg = getConfig()
      if (!cfg) return
      const a = findAnchor(e.target)
      if (!a || !a.href) return
      let url: URL
      try { url = new URL(a.href) } catch { return }
      const match = url.pathname.toLowerCase().match(/\.([a-z0-9]+)$/)
      if (!match) return
      const ext = match[1]
      if (!cfg.fileExtensions.includes(ext)) return
      track('File Download', { props: { url: a.href, extension: ext } })
    },
    true,
  )
}
