import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { Revenue } from '../../src/domain/event/Revenue'
import { _resetWarnings } from '../../src/domain/util/warn'

describe('Revenue.parse', () => {
  beforeEach(() => _resetWarnings())
  afterEach(() => vi.restoreAllMocks())

  it('accepts integer and 1-2 decimal amounts', () => {
    expect(Revenue.parse('29', 'EUR')?.toWire()).toEqual({ a: '29', c: 'EUR' })
    expect(Revenue.parse('29.9', 'EUR')?.toWire()).toEqual({ a: '29.9', c: 'EUR' })
    expect(Revenue.parse('29.99', 'usd')?.toWire()).toEqual({ a: '29.99', c: 'USD' })
  })

  it('uppercases the currency on the wire', () => {
    expect(Revenue.parse('1.00', 'eur')?.toWire().c).toBe('EUR')
  })

  it('rejects malformed amounts', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    expect(Revenue.parse('29.999', 'EUR')).toBeUndefined()
    expect(Revenue.parse('-1', 'EUR')).toBeUndefined()
    expect(Revenue.parse('abc', 'EUR')).toBeUndefined()
    expect(Revenue.parse(29 as unknown as string, 'EUR')).toBeUndefined()
  })

  it('rejects currencies that are not 3 letters', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    expect(Revenue.parse('1.00', 'EU')).toBeUndefined()
    expect(Revenue.parse('1.00', 'EURO')).toBeUndefined()
    expect(Revenue.parse('1.00', '12')).toBeUndefined()
  })
})
