import { describe, it, expect, beforeEach } from 'vitest'
import { buildPayload } from '../src/payload'

// The set of top-level keys the Takt backend ingestion accepts. Mirrors
// internal/event RawEvent in the takt repo. Update both together.
const ALLOWED_KEYS = new Set(['n', 'd', 'u', 'r', 'w', 'p', '$'])

describe('backend payload contract', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', 'https://example.com/')
  })

  it('emits only backend-known keys', () => {
    const p = buildPayload('Signup', 'example.com', {
      props: { plan: 'pro' },
      revenue: { amount: '29.00', currency: 'EUR' },
    })
    for (const k of Object.keys(p)) {
      expect(ALLOWED_KEYS.has(k)).toBe(true)
    }
    expect(Object.keys(p)).toEqual(expect.arrayContaining(['n', 'd', 'u', 'r', 'w']))
  })

  it('revenue uses short keys a (amount) and c (currency)', () => {
    const p = buildPayload('Signup', 'example.com', { revenue: { amount: '5.00', currency: 'USD' } })
    expect(Object.keys(p.$!)).toEqual(['a', 'c'])
  })
})
