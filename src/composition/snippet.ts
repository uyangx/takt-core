type TaktFn = ((name: string, opts?: unknown) => void) & { q?: unknown[][] }
type Opts = { props?: Record<string, string>; revenue?: { amount: string; currency: string } } | undefined

const FILE_RE = /\.(pdf|zip|xlsx|docx|mp4)$/

// runSnippet is exported for testing; the IIFE tail below auto-runs it in the browser.
export function runSnippet(el: HTMLScriptElement | null): void {
  const get = (k: string) => (el ? el.getAttribute(k) : null)
  const has = (k: string) => !!el && el.hasAttribute(k)
  const flag = (k: string, d: boolean) => { const v = get(k); return v === null ? d : v !== 'false' }

  const domain = get('data-domain') || location.hostname
  const endpoint = get('data-endpoint') || '/api/event'
  const excl = flag('data-exclude-localhost', true)
  const dnt = flag('data-respect-dnt', true)
  const outbound = has('data-outbound')
  const files = has('data-files')

  // Frozen short-circuit order: opt-out → DNT → localhost
  function blocked(): boolean {
    try { if (localStorage.getItem('takt_ignore') === '1') return true } catch { /* noop */ }
    if (dnt && (navigator.doNotTrack === '1' || navigator.doNotTrack === 'yes')) return true
    if (excl) {
      const h = location.hostname
      if (h === 'localhost' || h.startsWith('127.') || h.endsWith('.local') ||
          /^(10|192\.168|172\.(1[6-9]|2\d|3[01]))\./.test(h)) return true
    }
    return false
  }

  function emit(name: string, opts?: Opts): void {
    if (blocked()) return
    const p: Record<string, unknown> = { n: name, d: domain, u: location.href, r: document.referrer, w: window.innerWidth || 0 }
    if (opts?.props && Object.keys(opts.props).length > 0) p.p = opts.props
    if (opts?.revenue) p.$ = { a: opts.revenue.amount, c: opts.revenue.currency.toUpperCase() }
    const b = JSON.stringify(p)
    try {
      if (!navigator.sendBeacon?.(endpoint, b))
        void fetch(endpoint, { method: 'POST', body: b, keepalive: true }).catch(() => {})
    } catch { /* best-effort */ }
  }

  function track(name: string, opts?: Opts): void {
    if (typeof name !== 'string') return
    const n = name.trim()
    if (n && n !== 'pageview') emit(n, opts)
  }

  function pv(): void { emit('pageview') }

  if (outbound || files) {
    document.addEventListener('click', (e) => {
      let t = e.target as HTMLElement | null
      while (t && t.tagName !== 'A') t = t.parentElement
      const a = t as HTMLAnchorElement | null
      if (!a?.href) return
      let url: URL
      try { url = new URL(a.href) } catch { return }
      if (outbound && url.hostname !== location.hostname) track('Outbound Link: Click', { props: { url: a.href } })
      if (files) { const m = FILE_RE.exec(url.pathname.toLowerCase()); if (m) track('File Download', { props: { url: a.href, extension: m[1] } }) }
    }, true)
  }

  const push = history.pushState
  history.pushState = function (this: History, ...a: Parameters<History['pushState']>) {
    const r = push.apply(this, a); pv(); return r
  }
  window.addEventListener('popstate', pv)
  pv()

  const win = window as unknown as { takt?: TaktFn }
  const q = win.takt?.q
  win.takt = track as TaktFn
  if (q) for (const a of q) track(...(a as [string, Opts?]))
}

if (typeof document !== 'undefined') {
  const s = document.currentScript as HTMLScriptElement | null
  if (s) runSnippet(s)
}
