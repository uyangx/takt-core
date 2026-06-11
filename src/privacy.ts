import type { Config } from './state'

const OPT_OUT_KEY = 'takt_ignore'

export function optOut(): void {
  try { localStorage.setItem(OPT_OUT_KEY, '1') } catch { /* storage unavailable */ }
}

export function optIn(): void {
  try { localStorage.removeItem(OPT_OUT_KEY) } catch { /* storage unavailable */ }
}

function hasOptedOut(): boolean {
  try { return localStorage.getItem(OPT_OUT_KEY) === '1' } catch { return false }
}

function dntEnabled(): boolean {
  const v = navigator.doNotTrack
  return v === '1' || v === 'yes'
}

function isLocalhost(): boolean {
  const h = location.hostname
  return (
    h === 'localhost' ||
    h === '127.0.0.1' ||
    h === '::1' ||
    h.endsWith('.local') ||
    /^10\.|^192\.168\.|^172\.(1[6-9]|2\d|3[01])\./.test(h)
  )
}

// isBlocked applies the short-circuit order: opt-out -> DNT -> localhost.
export function isBlocked(cfg: Config): boolean {
  if (hasOptedOut()) return true
  if (cfg.respectDnt && dntEnabled()) return true
  if (cfg.excludeLocalhost && isLocalhost()) return true
  return false
}
