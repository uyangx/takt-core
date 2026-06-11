import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { track, pageview } from '../src/track'
import { configure, resetConfig } from '../src/state'
import * as transport from '../src/transport'

describe('track / pageview', () => {
  let sendSpy: ReturnType<typeof vi.spyOn>
  beforeEach(() => {
    resetConfig()
    localStorage.clear()
    window.history.replaceState({}, '', 'https://example.com/')
    Object.defineProperty(navigator, 'doNotTrack', { value: '0', configurable: true })
    sendSpy = vi.spyOn(transport, 'send').mockImplementation(() => {})
  })
  afterEach(() => { sendSpy.mockRestore() })

  it('does nothing if not configured', () => {
    track('Signup')
    expect(sendSpy).not.toHaveBeenCalled()
  })

  it('sends a custom event with props/revenue', () => {
    configure({ domain: 'example.com' })
    track('Signup', { props: { plan: 'pro' }, revenue: { amount: '29.00', currency: 'EUR' } })
    expect(sendSpy).toHaveBeenCalledOnce()
    const [endpoint, payload] = sendSpy.mock.calls[0]
    expect(endpoint).toBe('/api/event')
    expect(payload).toMatchObject({ n: 'Signup', d: 'example.com', p: { plan: 'pro' }, $: { a: '29.00', c: 'EUR' } })
  })

  it('rejects "pageview" as a custom name and trims', () => {
    configure({ domain: 'example.com' })
    track('  pageview  ')
    track('')
    track(123 as unknown as string)
    expect(sendSpy).not.toHaveBeenCalled()
  })

  it('pageview() sends name "pageview"', () => {
    configure({ domain: 'example.com' })
    pageview()
    expect(sendSpy.mock.calls[0][1]).toMatchObject({ n: 'pageview' })
  })

  it('does not send when blocked (opt-out)', () => {
    configure({ domain: 'example.com' })
    localStorage.setItem('takt_ignore', '1')
    track('Signup')
    pageview()
    expect(sendSpy).not.toHaveBeenCalled()
  })
})
