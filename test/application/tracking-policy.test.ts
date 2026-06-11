import { describe, it, expect } from 'vitest'
import { TrackingPolicy } from '../../src/application/consent/TrackingPolicy'
import type { ConsentStore } from '../../src/application/ports/ConsentStore'
import type { DoNotTrackProvider } from '../../src/application/ports/DoNotTrackProvider'
import type { EnvironmentProvider } from '../../src/application/ports/EnvironmentProvider'

// --- Fakes ---
function fakeConsent(optedOut = false): ConsentStore {
  let state = optedOut
  return {
    isOptedOut: () => state,
    optOut: () => { state = true },
    optIn: () => { state = false },
  }
}

function fakeDnt(enabled = false): DoNotTrackProvider {
  return { isEnabled: () => enabled }
}

function fakeEnv(hostname = 'example.com'): EnvironmentProvider {
  return {
    hostname: () => hostname,
    url: () => `https://${hostname}/`,
    referrer: () => '',
    width: () => 1280,
  }
}

const cfg = (
  over: Partial<{ respectDnt: boolean; excludeLocalhost: boolean; sampleRate: number }> = {},
) => ({
  respectDnt: true,
  excludeLocalhost: true,
  sampleRate: 1,
  ...over,
})

describe('TrackingPolicy.isBlocked()', () => {
  it('is not blocked by default', () => {
    const policy = new TrackingPolicy(fakeConsent(), fakeDnt(), fakeEnv(), cfg())
    expect(policy.isBlocked()).toBe(false)
  })

  it('blocks when opted out (short-circuit 1)', () => {
    const policy = new TrackingPolicy(
      fakeConsent(true),
      fakeDnt(false),
      fakeEnv('example.com'),
      cfg({ respectDnt: false, excludeLocalhost: false }),
    )
    expect(policy.isBlocked()).toBe(true)
  })

  it('blocks when DNT enabled (short-circuit 2)', () => {
    const policy = new TrackingPolicy(fakeConsent(), fakeDnt(true), fakeEnv(), cfg())
    expect(policy.isBlocked()).toBe(true)
  })

  it('does not block DNT when respectDnt is false', () => {
    const policy = new TrackingPolicy(
      fakeConsent(), fakeDnt(true), fakeEnv(), cfg({ respectDnt: false }),
    )
    expect(policy.isBlocked()).toBe(false)
  })

  it('blocks on localhost (short-circuit 3)', () => {
    const policy = new TrackingPolicy(fakeConsent(), fakeDnt(), fakeEnv('localhost'), cfg())
    expect(policy.isBlocked()).toBe(true)
  })

  it('blocks on 127.0.0.1', () => {
    const policy = new TrackingPolicy(fakeConsent(), fakeDnt(), fakeEnv('127.0.0.1'), cfg())
    expect(policy.isBlocked()).toBe(true)
  })

  it('blocks the whole 127.0.0.0/8 loopback range (parity with the snippet)', () => {
    const policy = new TrackingPolicy(fakeConsent(), fakeDnt(), fakeEnv('127.0.0.2'), cfg())
    expect(policy.isBlocked()).toBe(true)
  })

  it('blocks on ::1', () => {
    const policy = new TrackingPolicy(fakeConsent(), fakeDnt(), fakeEnv('::1'), cfg())
    expect(policy.isBlocked()).toBe(true)
  })

  it('blocks on *.local', () => {
    const policy = new TrackingPolicy(fakeConsent(), fakeDnt(), fakeEnv('myapp.local'), cfg())
    expect(policy.isBlocked()).toBe(true)
  })

  it('blocks on RFC-1918 10.x', () => {
    const policy = new TrackingPolicy(fakeConsent(), fakeDnt(), fakeEnv('10.0.0.1'), cfg())
    expect(policy.isBlocked()).toBe(true)
  })

  it('blocks on RFC-1918 192.168.x', () => {
    const policy = new TrackingPolicy(fakeConsent(), fakeDnt(), fakeEnv('192.168.1.1'), cfg())
    expect(policy.isBlocked()).toBe(true)
  })

  it('blocks on RFC-1918 172.16-31.x', () => {
    const policy = new TrackingPolicy(fakeConsent(), fakeDnt(), fakeEnv('172.16.0.1'), cfg())
    expect(policy.isBlocked()).toBe(true)
  })

  it('does not block localhost when excludeLocalhost is false', () => {
    const policy = new TrackingPolicy(
      fakeConsent(), fakeDnt(), fakeEnv('localhost'), cfg({ excludeLocalhost: false }),
    )
    expect(policy.isBlocked()).toBe(false)
  })

  it('opt-out takes priority over DNT and localhost being disabled', () => {
    const consent = fakeConsent()
    const policy = new TrackingPolicy(
      consent, fakeDnt(false), fakeEnv('example.com'),
      cfg({ respectDnt: false, excludeLocalhost: false }),
    )
    consent.optOut()
    expect(policy.isBlocked()).toBe(true)
  })

  it('blocks when sampling roll lands above the rate', () => {
    const policy = new TrackingPolicy(
      fakeConsent(), fakeDnt(), fakeEnv(), cfg({ sampleRate: 0.5 }), () => 0.9,
    )
    expect(policy.isBlocked()).toBe(true)
  })

  it('does not block when sampling roll lands below the rate', () => {
    const policy = new TrackingPolicy(
      fakeConsent(), fakeDnt(), fakeEnv(), cfg({ sampleRate: 0.5 }), () => 0.1,
    )
    expect(policy.isBlocked()).toBe(false)
  })

  it('never samples out when sampleRate is 1 (random untouched)', () => {
    let called = false
    const policy = new TrackingPolicy(
      fakeConsent(), fakeDnt(), fakeEnv(), cfg({ sampleRate: 1 }),
      () => { called = true; return 0.999 },
    )
    expect(policy.isBlocked()).toBe(false)
    expect(called).toBe(false)
  })

  it('opt-out checked before DNT (DNT disabled but opted out → blocked)', () => {
    // Confirms order: opt-out wins even when both could block
    const consent = fakeConsent(true)
    let dntCalled = false
    const dnt: DoNotTrackProvider = {
      isEnabled: () => { dntCalled = true; return false },
    }
    const policy = new TrackingPolicy(consent, dnt, fakeEnv(), cfg())
    expect(policy.isBlocked()).toBe(true)
    // DNT must NOT have been consulted if opt-out short-circuited first
    expect(dntCalled).toBe(false)
  })
})
