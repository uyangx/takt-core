import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { warnOnce, _resetWarnings } from '../../src/domain/util/warn'

describe('warnOnce', () => {
  beforeEach(() => _resetWarnings())
  afterEach(() => vi.restoreAllMocks())

  it('warns once per unique message and prefixes [takt]', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    warnOnce('boom')
    warnOnce('boom')
    warnOnce('boom')
    expect(spy).toHaveBeenCalledOnce()
    expect(spy).toHaveBeenCalledWith('[takt] boom')
  })

  it('warns again for distinct messages', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    warnOnce('a')
    warnOnce('b')
    expect(spy).toHaveBeenCalledTimes(2)
  })
})
