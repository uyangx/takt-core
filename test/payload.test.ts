// @vitest-environment jsdom
// @vitest-environment-options { "url": "https://example.com/" }
import { describe, it, expect, beforeEach } from 'vitest'
import { buildPayload } from '../src/payload'

describe('buildPayload', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', 'https://example.com/pricing')
    Object.defineProperty(document, 'referrer', { value: 'https://ref.test/', configurable: true })
    Object.defineProperty(window, 'innerWidth', { value: 1280, configurable: true })
  })

  it('builds a pageview payload with core fields', () => {
    const p = buildPayload('pageview', 'example.com')
    expect(p.n).toBe('pageview')
    expect(p.d).toBe('example.com')
    expect(p.u).toBe('https://example.com/pricing')
    expect(p.r).toBe('https://ref.test/')
    expect(p.w).toBe(1280)
    expect(p.p).toBeUndefined()
    expect(p.$).toBeUndefined()
  })

  it('maps props to p and revenue to $:{a,c}', () => {
    const p = buildPayload('Signup', 'example.com', {
      props: { plan: 'pro' },
      revenue: { amount: '29.00', currency: 'eur' },
    })
    expect(p.p).toEqual({ plan: 'pro' })
    expect(p.$).toEqual({ a: '29.00', c: 'EUR' })
  })

  it('omits empty props object', () => {
    const p = buildPayload('Signup', 'example.com', { props: {} })
    expect(p.p).toBeUndefined()
  })
})
