import { init, track } from './index'

type TaktFn = ((name: string, opts?: unknown) => void) & { q?: unknown[] }

// runSnippet is exported for testing; the IIFE tail below auto-runs it in the browser.
export function runSnippet(el: HTMLScriptElement | null): void {
  const get = (k: string) => (el ? el.getAttribute(k) : null)
  const has = (k: string) => !!el && el.hasAttribute(k)
  const flag = (k: string, def: boolean) => {
    const v = get(k)
    if (v === null) return def
    return v !== 'false'
  }

  init({
    domain: get('data-domain') || location.hostname,
    endpoint: get('data-endpoint') || '/api/event',
    outbound: has('data-outbound'),
    files: has('data-files'),
    excludeLocalhost: flag('data-exclude-localhost', true),
    respectDnt: flag('data-respect-dnt', true),
  })

  const queued = (window as unknown as { takt?: TaktFn }).takt
  const queue = queued && queued.q
  const fn: TaktFn = (name, opts) => track(name, opts as never)
  ;(window as unknown as { takt: TaktFn }).takt = fn
  if (queue) {
    for (const args of queue) fn(...(args as [string, unknown?]))
  }
}

// Auto-init in the browser: resolve the currently-executing <script> tag.
if (typeof document !== 'undefined') {
  const current = (document.currentScript as HTMLScriptElement | null) || null
  // currentScript is null inside the test import; tests call runSnippet directly.
  if (current) runSnippet(current)
}
