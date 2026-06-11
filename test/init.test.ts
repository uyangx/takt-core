import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { init } from '../src/index'
import { resetConfig } from '../src/state'
import * as transport from '../src/transport'
import * as outbound from '../src/autocapture/outbound'
import * as files from '../src/autocapture/files'
import type { Config, TrackOptions, Revenue, Payload } from '../src/index'

// compile-time check: public types are exported
const _cfg: Partial<Config> = { domain: 'x' }
const _opts: TrackOptions = { props: { a: 'b' } }
const _rev: Revenue = { amount: '1.00', currency: 'EUR' }
const _pl: Pick<Payload, 'n'> = { n: 'pageview' }
void _cfg; void _opts; void _rev; void _pl

describe('init', () => {
  let sendSpy: ReturnType<typeof vi.spyOn>
  let oSpy: ReturnType<typeof vi.spyOn>
  let fSpy: ReturnType<typeof vi.spyOn>
  beforeEach(() => {
    resetConfig()
    localStorage.clear()
    window.history.replaceState({}, '', 'https://example.com/')
    Object.defineProperty(navigator, 'doNotTrack', { value: '0', configurable: true })
    sendSpy = vi.spyOn(transport, 'send').mockImplementation(() => {})
    oSpy = vi.spyOn(outbound, 'enableOutbound').mockImplementation(() => {})
    fSpy = vi.spyOn(files, 'enableFiles').mockImplementation(() => {})
  })
  afterEach(() => {
    sendSpy.mockRestore()
    oSpy.mockRestore()
    fSpy.mockRestore()
  })

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

  it('enables outbound autocapture when outbound flag is set', () => {
    init({ domain: 'example.com', outbound: true, auto: false })
    expect(oSpy).toHaveBeenCalledOnce()
    expect(fSpy).not.toHaveBeenCalled()
  })

  it('enables file autocapture when files flag is set', () => {
    init({ domain: 'example.com', files: true, auto: false })
    expect(fSpy).toHaveBeenCalledOnce()
    expect(oSpy).not.toHaveBeenCalled()
  })
})
