import { describe, it, expect } from 'vitest'
import createUrlScrubber from '../../src/domain/url/UrlScrubber'

describe('createUrlScrubber', () => {
  it('strips query and hash by default', () => {
    const scrub = createUrlScrubber()
    expect(scrub('https://example.com/path?token=secret#frag')).toBe('https://example.com/path')
  })

  it('keeps everything when trackQuery is true', () => {
    const scrub = createUrlScrubber({ trackQuery: true })
    expect(scrub('https://example.com/path?token=secret#frag')).toBe(
      'https://example.com/path?token=secret#frag',
    )
  })

  it('keeps only allowlisted query params', () => {
    const scrub = createUrlScrubber({ queryParams: ['utm_source', 'ref'] })
    expect(scrub('https://example.com/p?utm_source=newsletter&token=secret&ref=x')).toBe(
      'https://example.com/p?utm_source=newsletter&ref=x',
    )
  })

  it('drops the query entirely when no allowlisted param is present', () => {
    const scrub = createUrlScrubber({ queryParams: ['utm_source'] })
    expect(scrub('https://example.com/p?token=secret')).toBe('https://example.com/p')
  })

  it('uses a custom scrubber when provided', () => {
    const scrub = createUrlScrubber({ custom: () => 'redacted' })
    expect(scrub('https://example.com/anything?x=1')).toBe('redacted')
  })

  it('custom takes precedence over trackQuery and queryParams', () => {
    const scrub = createUrlScrubber({ custom: () => 'X', trackQuery: true, queryParams: ['a'] })
    expect(scrub('https://example.com/p?a=1')).toBe('X')
  })

  it('returns the raw string when the URL cannot be parsed', () => {
    const scrub = createUrlScrubber()
    expect(scrub('not a url')).toBe('not a url')
    expect(scrub('')).toBe('')
  })
})
