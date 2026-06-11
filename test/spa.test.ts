import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { enableSpa } from '../src/spa'
import { configure, resetConfig } from '../src/state'
import * as transport from '../src/transport'

describe('enableSpa', () => {
  let sendSpy: ReturnType<typeof vi.spyOn>
  const originalPush = history.pushState
  beforeEach(() => {
    resetConfig()
    localStorage.clear()
    window.history.replaceState({}, '', 'https://example.com/')
    Object.defineProperty(navigator, 'doNotTrack', { value: '0', configurable: true })
    sendSpy = vi.spyOn(transport, 'send').mockImplementation(() => {})
    configure({ domain: 'example.com' })
  })
  afterEach(() => {
    sendSpy.mockRestore()
    history.pushState = originalPush
  })

  it('emits a pageview on pushState', () => {
    enableSpa()
    history.pushState({}, '', '/pricing')
    expect(sendSpy).toHaveBeenCalledOnce()
    expect(sendSpy.mock.calls[0][1]).toMatchObject({ n: 'pageview', u: 'https://example.com/pricing' })
  })

  it('emits a pageview on popstate', () => {
    enableSpa()
    window.dispatchEvent(new PopStateEvent('popstate'))
    expect(sendSpy).toHaveBeenCalledOnce()
  })

  it('does not emit on enableSpa itself (no double-count on load)', () => {
    enableSpa()
    expect(sendSpy).not.toHaveBeenCalled()
  })
})
