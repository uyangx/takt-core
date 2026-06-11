import { describe, it, expect, beforeEach } from 'vitest'
import { configure, getConfig, resetConfig } from '../src/state'

describe('config state', () => {
  beforeEach(() => { resetConfig() })

  it('returns null before configure', () => {
    expect(getConfig()).toBeNull()
  })

  it('applies defaults and overrides', () => {
    const cfg = configure({ domain: 'example.com', outbound: true })
    expect(cfg.domain).toBe('example.com')
    expect(cfg.endpoint).toBe('/api/event')
    expect(cfg.auto).toBe(true)
    expect(cfg.outbound).toBe(true)
    expect(cfg.files).toBe(false)
    expect(cfg.respectDnt).toBe(true)
    expect(cfg.excludeLocalhost).toBe(true)
    expect(cfg.fileExtensions).toContain('pdf')
    expect(getConfig()).toBe(cfg)
  })

  it('falls back to location.hostname when domain omitted', () => {
    Object.defineProperty(window, 'location', {
      value: { hostname: 'fallback.test' },
      configurable: true,
    })
    const cfg = configure({})
    expect(cfg.domain).toBe('fallback.test')
  })
})
