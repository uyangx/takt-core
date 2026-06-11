import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { init } from '../src/index'
import { resetConfig } from '../src/state'
import * as transport from '../src/transport'

describe('init', () => {
  let sendSpy: ReturnType<typeof vi.spyOn>
  beforeEach(() => {
    resetConfig()
    localStorage.clear()
    window.history.replaceState({}, '', 'https://example.com/')
    Object.defineProperty(navigator, 'doNotTrack', { value: '0', configurable: true })
    sendSpy = vi.spyOn(transport, 'send').mockImplementation(() => {})
  })
  afterEach(() => { sendSpy.mockRestore() })

  it('sends an initial pageview when auto is true', () => {
    init({ domain: 'example.com' })
    expect(sendSpy).toHaveBeenCalledOnce()
    expect(sendSpy.mock.calls[0][1]).toMatchObject({ n: 'pageview' })
  })

  it('does not send an initial pageview when auto is false', () => {
    init({ domain: 'example.com', auto: false })
    expect(sendSpy).not.toHaveBeenCalled()
  })

  it('re-exports the public API', async () => {
    const mod = await import('../src/index')
    expect(typeof mod.track).toBe('function')
    expect(typeof mod.pageview).toBe('function')
    expect(typeof mod.optOut).toBe('function')
    expect(typeof mod.optIn).toBe('function')
  })
})
