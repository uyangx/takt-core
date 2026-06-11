import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { Props } from '../../src/domain/event/Props'
import { _resetWarnings } from '../../src/domain/util/warn'

describe('Props', () => {
  beforeEach(() => _resetWarnings())
  afterEach(() => vi.restoreAllMocks())

  it('is empty when constructed without input', () => {
    expect(new Props().isEmpty()).toBe(true)
    expect(new Props().toWire()).toBeUndefined()
  })

  it('keeps valid string entries', () => {
    expect(new Props({ plan: 'pro', n: '3' }).toWire()).toEqual({ plan: 'pro', n: '3' })
  })

  it('coerces non-string values to strings', () => {
    expect(new Props({ count: 3, on: true }).toWire()).toEqual({ count: '3', on: 'true' })
  })

  it('drops null, undefined and empty-string values', () => {
    const props = new Props({ a: '', b: null, c: undefined, d: 'keep' } as Record<string, unknown>)
    expect(props.toWire()).toEqual({ d: 'keep' })
  })

  it('truncates over-long keys and values, warning once', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const longKey = 'k'.repeat(100)
    const longValue = 'v'.repeat(2000)
    const wire = new Props({ [longKey]: longValue })!.toWire()!
    const [key, value] = Object.entries(wire)[0]
    expect(key.length).toBe(Props.MAX_KEY_LENGTH)
    expect(value.length).toBe(Props.MAX_VALUE_LENGTH)
    expect(spy).toHaveBeenCalled()
  })

  it('caps the number of keys at MAX_PROPS and warns', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const raw: Record<string, string> = {}
    for (let i = 0; i < Props.MAX_PROPS + 10; i++) raw[`k${i}`] = String(i)
    const wire = new Props(raw).toWire()!
    expect(Object.keys(wire).length).toBe(Props.MAX_PROPS)
    expect(spy).toHaveBeenCalled()
  })
})
