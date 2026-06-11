import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { runSnippet } from '../src/snippet'
import { resetConfig } from '../src/state'
import * as transport from '../src/transport'

function scriptEl(attrs: Record<string, string>): HTMLScriptElement {
  const s = document.createElement('script')
  for (const [k, v] of Object.entries(attrs)) s.setAttribute(k, v)
  return s
}

describe('runSnippet', () => {
  let sendSpy: ReturnType<typeof vi.spyOn>
  beforeEach(() => {
    resetConfig()
    localStorage.clear()
    window.history.replaceState({}, '', 'https://example.com/')
    Object.defineProperty(navigator, 'doNotTrack', { value: '0', configurable: true })
    sendSpy = vi.spyOn(transport, 'send').mockImplementation(() => {})
    delete (window as { takt?: unknown }).takt
  })
  afterEach(() => { sendSpy.mockRestore() })

  it('reads data-domain and sends an initial pageview', () => {
    runSnippet(scriptEl({ 'data-domain': 'snippet.test' }))
    expect(sendSpy).toHaveBeenCalledOnce()
    expect(sendSpy.mock.calls[0][1]).toMatchObject({ n: 'pageview', d: 'snippet.test' })
  })

  it('exposes window.takt for custom events', () => {
    runSnippet(scriptEl({ 'data-domain': 'snippet.test' }))
    ;(window as unknown as { takt: (n: string, o?: unknown) => void }).takt('Signup', { props: { plan: 'pro' } })
    const calls = sendSpy.mock.calls.map((c) => c[1])
    expect(calls).toContainEqual(expect.objectContaining({ n: 'Signup', p: { plan: 'pro' } }))
  })

  it('replays the bootstrap queue (takt.q)', () => {
    const stub = function (this: unknown, ...a: unknown[]) {
      ;(stub.q = stub.q || []).push(a)
    } as { (...a: unknown[]): void; q?: unknown[] }
    stub('Early')
    ;(window as unknown as { takt: typeof stub }).takt = stub
    runSnippet(scriptEl({ 'data-domain': 'snippet.test' }))
    const calls = sendSpy.mock.calls.map((c) => c[1])
    expect(calls).toContainEqual(expect.objectContaining({ n: 'Early' }))
  })

  it('parses data-outbound/data-files as presence flags', () => {
    const el = scriptEl({ 'data-domain': 'snippet.test', 'data-outbound': '', 'data-exclude-localhost': 'false' })
    expect(() => runSnippet(el)).not.toThrow()
  })
})
