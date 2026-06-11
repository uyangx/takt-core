import { describe, it, expect, vi, afterEach } from 'vitest'
import { send } from '../src/transport'
import type { Payload } from '../src/payload'

const payload: Payload = { n: 'pageview', d: 'example.com', u: 'https://example.com/', r: '', w: 0 }

describe('send', () => {
  afterEach(() => { vi.unstubAllGlobals() })

  it('uses navigator.sendBeacon when available', () => {
    const beacon = vi.fn(() => true)
    vi.stubGlobal('navigator', { sendBeacon: beacon })
    send('/api/event', payload)
    expect(beacon).toHaveBeenCalledOnce()
    expect((beacon.mock.calls as unknown[][])[0][0]).toBe('/api/event')
    expect((beacon.mock.calls as unknown[][])[0][1]).toBe(JSON.stringify(payload))
  })

  it('falls back to fetch keepalive when sendBeacon missing', () => {
    const fetchMock = vi.fn(() => Promise.resolve(new Response()))
    vi.stubGlobal('navigator', {})
    vi.stubGlobal('fetch', fetchMock)
    send('/api/event', payload)
    expect(fetchMock).toHaveBeenCalledOnce()
    const [url, opts] = (fetchMock.mock.calls as unknown[][])[0] as [string, RequestInit]
    expect(url).toBe('/api/event')
    expect(opts).toMatchObject({ method: 'POST', keepalive: true, body: JSON.stringify(payload) })
  })

  it('never throws when transport is unavailable', () => {
    vi.stubGlobal('navigator', {})
    vi.stubGlobal('fetch', undefined)
    expect(() => send('/api/event', payload)).not.toThrow()
  })
})
