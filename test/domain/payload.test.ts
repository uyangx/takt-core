import { describe, it, expect, beforeEach } from 'vitest'
import { EventName } from '../../src/domain/event/EventName'
import { Props } from '../../src/domain/event/Props'
import { Revenue } from '../../src/domain/event/Revenue'
import { AnalyticsEvent } from '../../src/domain/event/AnalyticsEvent'
import { buildPayload } from '../../src/domain/event/Payload'

const env = {
  domain: 'example.com',
  url: 'https://example.com/pricing',
  referrer: 'https://ref.test/',
  width: 1280,
}

// The set of top-level keys the Takt backend ingestion accepts. FROZEN.
const ALLOWED_KEYS = new Set(['n', 'd', 'u', 'r', 'w', 'p', '$'])
const REQUIRED_KEYS = ['n', 'd', 'u', 'r', 'w']

describe('domain payload contract (wire DTO)', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', 'https://example.com/pricing')
  })

  it('emits only backend-known keys', () => {
    const event = new AnalyticsEvent(
      new EventName('Signup'),
      new Props({ plan: 'pro' }),
      new Revenue('29.00', 'EUR'),
    )
    const p = buildPayload(event, env)
    for (const k of Object.keys(p)) {
      expect(ALLOWED_KEYS.has(k)).toBe(true)
    }
  })

  it('always includes required keys n,d,u,r,w', () => {
    const event = new AnalyticsEvent(new EventName('pageview'))
    const p = buildPayload(event, env)
    expect(Object.keys(p)).toEqual(expect.arrayContaining(REQUIRED_KEYS))
  })

  it('maps core fields correctly', () => {
    const event = new AnalyticsEvent(new EventName('pageview'))
    const p = buildPayload(event, env)
    expect(p.n).toBe('pageview')
    expect(p.d).toBe('example.com')
    expect(p.u).toBe('https://example.com/pricing')
    expect(p.r).toBe('https://ref.test/')
    expect(p.w).toBe(1280)
    expect(p.p).toBeUndefined()
    expect(p.$).toBeUndefined()
  })

  it('maps props to p key', () => {
    const event = new AnalyticsEvent(new EventName('Signup'), new Props({ plan: 'pro' }))
    const p = buildPayload(event, env)
    expect(p.p).toEqual({ plan: 'pro' })
  })

  it('omits p when props are empty', () => {
    const event = new AnalyticsEvent(new EventName('Signup'), new Props({}))
    const p = buildPayload(event, env)
    expect(p.p).toBeUndefined()
  })

  it('revenue uses short keys a (amount) and c (currency uppercased)', () => {
    const event = new AnalyticsEvent(
      new EventName('Purchase'),
      undefined,
      new Revenue('5.00', 'usd'),
    )
    const p = buildPayload(event, env)
    expect(Object.keys(p.$!)).toEqual(['a', 'c'])
    expect(p.$).toEqual({ a: '5.00', c: 'USD' })
  })

  it('revenue keys are exactly [a,c]', () => {
    const event = new AnalyticsEvent(
      new EventName('Purchase'),
      undefined,
      new Revenue('29.00', 'eur'),
    )
    const p = buildPayload(event, env)
    expect(Object.keys(p.$!)).toHaveLength(2)
    expect(Object.keys(p.$!)).toContain('a')
    expect(Object.keys(p.$!)).toContain('c')
  })
})
