import { describe, it, expect, vi, afterEach } from 'vitest'
import { ResilientTransport } from '../../src/infrastructure/transport/ResilientTransport'
import type { Payload } from '../../src/domain/event/Payload'

const payload: Payload = { n: 'pageview', d: 'example.com', u: 'https://example.com/', r: '', w: 0 }

describe('ResilientTransport', () => {
  afterEach(() => { vi.unstubAllGlobals() })

  it('uses navigator.sendBeacon when available', () => {
    const beacon = vi.fn(() => true)
    vi.stubGlobal('navigator', { sendBeacon: beacon })
    new ResilientTransport('/api/event').send(payload)
    expect(beacon).toHaveBeenCalledOnce()
    expect((beacon.mock.calls as unknown[][])[0][0]).toBe('/api/event')
    expect((beacon.mock.calls as unknown[][])[0][1]).toBe(JSON.stringify(payload))
  })

  it('falls back to fetch keepalive when sendBeacon missing', () => {
    const fetchMock = vi.fn(() => Promise.resolve(new Response()))
    vi.stubGlobal('navigator', {})
    vi.stubGlobal('fetch', fetchMock)
    new ResilientTransport('/api/event').send(payload)
    expect(fetchMock).toHaveBeenCalledOnce()
    const [url, opts] = (fetchMock.mock.calls as unknown[][])[0] as [string, RequestInit]
    expect(url).toBe('/api/event')
    expect(opts).toMatchObject({ method: 'POST', keepalive: true, body: JSON.stringify(payload) })
  })

  it('falls back to fetch when sendBeacon returns false', () => {
    const beacon = vi.fn(() => false)
    const fetchMock = vi.fn(() => Promise.resolve(new Response()))
    vi.stubGlobal('navigator', { sendBeacon: beacon })
    vi.stubGlobal('fetch', fetchMock)
    new ResilientTransport('/api/event').send(payload)
    expect(fetchMock).toHaveBeenCalledOnce()
  })

  it('never throws when transport is unavailable', () => {
    vi.stubGlobal('navigator', {})
    vi.stubGlobal('fetch', undefined)
    expect(() => new ResilientTransport('/api/event').send(payload)).not.toThrow()
  })
})
