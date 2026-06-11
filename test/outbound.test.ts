import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { enableOutbound } from '../src/autocapture/outbound'
import { configure, resetConfig } from '../src/state'
import * as track from '../src/track'

function clickLink(href: string) {
  const a = document.createElement('a')
  a.href = href
  a.textContent = 'link'
  document.body.appendChild(a)
  a.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
  return a
}

describe('enableOutbound', () => {
  let trackSpy: ReturnType<typeof vi.spyOn>
  beforeEach(() => {
    resetConfig()
    document.body.innerHTML = ''
    window.history.replaceState({}, '', 'https://example.com/')
    configure({ domain: 'example.com' })
    trackSpy = vi.spyOn(track, 'track').mockImplementation(() => {})
    enableOutbound()
  })
  afterEach(() => { trackSpy.mockRestore() })

  it('tracks an outbound link click', () => {
    clickLink('https://external.test/page')
    expect(trackSpy).toHaveBeenCalledWith('Outbound Link: Click', {
      props: { url: 'https://external.test/page' },
    })
  })

  it('ignores internal (same-host) links', () => {
    clickLink('https://example.com/internal')
    expect(trackSpy).not.toHaveBeenCalled()
  })
})
