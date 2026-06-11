import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { optOut, optIn, isBlocked } from '../src/privacy'
import type { Config } from '../src/state'

const cfg = (over: Partial<Config> = {}): Config => ({
  domain: 'example.com', endpoint: '/api/event',
  respectDnt: true, excludeLocalhost: true, ...over,
})

describe('privacy', () => {
  beforeEach(() => {
    localStorage.clear()
    window.history.replaceState({}, '', 'https://example.com/')
    Object.defineProperty(navigator, 'doNotTrack', { value: '0', configurable: true })
  })
  afterEach(() => { vi.unstubAllGlobals() })

  it('not blocked by default', () => {
    expect(isBlocked(cfg())).toBe(false)
  })

  it('blocks after optOut and unblocks after optIn (persisted)', () => {
    optOut()
    expect(localStorage.getItem('takt_ignore')).toBe('1')
    expect(isBlocked(cfg())).toBe(true)
    optIn()
    expect(isBlocked(cfg())).toBe(false)
  })

  it('blocks on DNT when respectDnt', () => {
    Object.defineProperty(navigator, 'doNotTrack', { value: '1', configurable: true })
    expect(isBlocked(cfg({ respectDnt: true }))).toBe(true)
    expect(isBlocked(cfg({ respectDnt: false }))).toBe(false)
  })

  it('blocks on localhost when excludeLocalhost', () => {
    Object.defineProperty(window, 'location', {
      value: { hostname: 'localhost', href: 'http://localhost:5173/' },
      configurable: true,
    })
    expect(isBlocked(cfg({ excludeLocalhost: true }))).toBe(true)
    expect(isBlocked(cfg({ excludeLocalhost: false }))).toBe(false)
  })

  it('opt-out wins even when DNT and localhost are off', () => {
    optOut()
    expect(isBlocked(cfg({ respectDnt: false, excludeLocalhost: false }))).toBe(true)
  })
})
