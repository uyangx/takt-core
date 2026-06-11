export type UrlScrubber = (rawUrl: string) => string

export interface UrlScrubOptions {
  trackQuery?: boolean
  queryParams?: string[]
  custom?: UrlScrubber
}

// Default strips query + hash (origin + pathname only) so tokens/emails in
// `?...`/`#...` never reach analytics. Order: custom → trackQuery → allowlist → strip.
export default function createUrlScrubber(options: UrlScrubOptions = {}): UrlScrubber {
  if (options.custom) return options.custom
  if (options.trackQuery) return (raw) => raw

  const allow = options.queryParams
  return (raw) => {
    let url: URL
    try {
      url = new URL(raw)
    } catch {
      return raw
    }
    if (allow && allow.length > 0) {
      const kept = new URLSearchParams()
      for (const name of allow) {
        const value = url.searchParams.get(name)
        if (value !== null) kept.set(name, value)
      }
      const qs = kept.toString()
      return url.origin + url.pathname + (qs ? `?${qs}` : '')
    }
    return url.origin + url.pathname
  }
}
