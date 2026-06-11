import type { ConsentStore } from '../../application/ports/ConsentStore'

const OPT_OUT_KEY = 'takt_ignore'

export class LocalStorageConsentStore implements ConsentStore {
  isOptedOut(): boolean {
    try { return localStorage.getItem(OPT_OUT_KEY) === '1' } catch { return false }
  }

  optOut(): void {
    try { localStorage.setItem(OPT_OUT_KEY, '1') } catch { /* storage unavailable */ }
  }

  optIn(): void {
    try { localStorage.removeItem(OPT_OUT_KEY) } catch { /* storage unavailable */ }
  }
}
