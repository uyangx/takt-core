import { send } from './transport'

type TaktFn = ((name: string, opts?: unknown) => void) & { q?: unknown[] }
type Opts = { props?: Record<string, string> } | undefined

let endpoint = ''
let domain = ''
let respectDnt = true
let excludeLocalhost = true

function emit(name: string, opts?: Opts): void {
  if (!domain) return
  try { if (localStorage.getItem('takt_ignore') === '1') return } catch { /* noop */ }
  if (respectDnt && (navigator.doNotTrack === '1' || navigator.doNotTrack === 'yes')) return
  if (excludeLocalhost) {
    const h = location.hostname
    if (h === 'localhost' || h.startsWith('127.') || h === '::1' || h.endsWith('.local') || /^(10|192\.168|172\.(1[6-9]|2\d|3[01]))\./.test(h)) return
  }
  const p: Record<string, unknown> = { n: name, d: domain, u: location.href, r: document.referrer, w: window.innerWidth || 0 }
  if (opts?.props) p.p = opts.props
  send(endpoint, p as unknown as Parameters<typeof send>[1])
}

function track(name: string, opts?: Opts): void {
  const n = name.trim()
  if (n && n !== 'pageview') emit(n, opts)
}

function pageview(): void { emit('pageview') }

function anchor(t: EventTarget | null): HTMLAnchorElement | null {
  let el = t as HTMLElement | null
  while (el && el.tagName !== 'A') el = el.parentElement
  return el as HTMLAnchorElement | null
}

// runSnippet is exported for testing; the IIFE tail below auto-runs it in the browser.
export function runSnippet(el: HTMLScriptElement | null): void {
  const get = (k: string) => (el ? el.getAttribute(k) : null)
  const has = (k: string) => !!el && el.hasAttribute(k)
  const flag = (k: string, def: boolean) => { const v = get(k); return v === null ? def : v !== 'false' }

  domain = get('data-domain') || location.hostname
  endpoint = get('data-endpoint') || '/api/event'
  excludeLocalhost = flag('data-exclude-localhost', true)
  respectDnt = flag('data-respect-dnt', true)

  const outbound = has('data-outbound')
  const files = has('data-files')

  if (outbound || files) {
    document.addEventListener('click', (e) => {
      const a = anchor(e.target)
      if (!a?.href) return
      let url: URL
      try { url = new URL(a.href) } catch { return }
      if (outbound && url.hostname !== location.hostname) {
        track('Outbound Link: Click', { props: { url: a.href } })
      }
      if (files) {
        const m = url.pathname.toLowerCase().match(/\.(pdf|zip|dmg|docx?|xlsx?|csv|pptx?|rar|7z|gz|mp[34]|wav|avi|mov)$/)
        if (m) track('File Download', { props: { url: a.href, extension: m[1] } })
      }
    }, true)
  }

  // SPA support
  const push = history.pushState
  history.pushState = function (this: History, ...args: Parameters<History['pushState']>) {
    const r = push.apply(this, args)
    pageview()
    return r
  }
  window.addEventListener('popstate', pageview)
  pageview()

  // Bootstrap queue
  const win = window as unknown as { takt?: TaktFn }
  const queue = win.takt?.q
  win.takt = track as TaktFn
  if (queue) for (const args of queue) track(...(args as [string, Opts?]))
}

// Auto-init in the browser: resolve the currently-executing <script> tag.
if (typeof document !== 'undefined') {
  const current = (document.currentScript as HTMLScriptElement | null) || null
  // currentScript is null inside the test import; tests call runSnippet directly.
  if (current) runSnippet(current)
}
