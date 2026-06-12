type TaktFn = ((name: string, opts?: unknown) => void) & { q?: unknown[][] }
type Opts = { props?: Record<string, string>; revenue?: { amount: string; currency: string } } | undefined

const FILE_RE = /\.(pdf|zip|xlsx|docx|mp4)$/

// runSnippet is exported for testing; the IIFE tail below auto-runs it in the browser.
export function runSnippet(el: HTMLScriptElement | null): void {
  const get = (k: string) => (el ? el.getAttribute(k) : null)
  const has = (k: string) => !!el && el.hasAttribute(k)

  const domain = get('data-domain') || location.hostname
  const endpoint = get('data-endpoint') || '/api/event'
  const excl = get('data-exclude-localhost') !== 'false'
  const outbound = has('data-outbound')
  const files = has('data-files')

  // Always strips query + hash. The full SDK exposes trackQuery to keep it.
  const scrub = (raw: string) => {
    try { const u = new URL(raw); return u.origin + u.pathname } catch { return raw }
  }

  // Frozen short-circuit order: opt-out → DNT → localhost
  function emit(name: string, opts?: Opts): void {
    try { if (localStorage.getItem('takt_ignore') === '1') return } catch { /* noop */ }
    // Standard DNT value only; the full SDK also honors the legacy 'yes'
    // (old Firefox/Safari) — omitted here to stay within the ≤1 kB budget.
    if (navigator.doNotTrack === '1') return
    if (excl) {
      const h = location.hostname
      if (h === 'localhost' || h === '::1' || h === '0.0.0.0' || h.endsWith('.local') ||
          /^(127|10|192\.168|172\.(1[6-9]|2\d|3[01]))\./.test(h)) return
    }
    const p: Record<string, unknown> = { n: name, d: domain, u: scrub(location.href), r: scrub(document.referrer), w: innerWidth }
    if (opts?.props && Object.keys(opts.props).length) p.p = opts.props
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
      const a = (e.target as Element)?.closest?.('a') as HTMLAnchorElement | null
      if (!a?.href) return
      let url: URL
      try { url = new URL(a.href) } catch { return }
      if (url.protocol.indexOf('http')) return
      const dest = url.origin + url.pathname
      if (outbound && url.hostname !== location.hostname) track('Outbound Link: Click', { props: { url: dest } })
      if (files) { const m = FILE_RE.exec(url.pathname.toLowerCase()); if (m) track('File Download', { props: { url: dest, extension: m[1] } }) }
    }, true)
  }

  for (const k of ['pushState', 'replaceState'] as const) {
    const o = history[k]
    history[k] = function (this: History, ...a: Parameters<History['pushState']>) {
      const r = o.apply(this, a); pv(); return r
    }
  }
  addEventListener('popstate', pv)
  addEventListener('hashchange', pv)
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
