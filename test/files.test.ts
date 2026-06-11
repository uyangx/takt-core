import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { enableFiles } from '../src/autocapture/files'
import { configure, resetConfig } from '../src/state'
import * as track from '../src/track'

function clickLink(href: string) {
  const a = document.createElement('a')
  a.href = href
  document.body.appendChild(a)
  a.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
}

describe('enableFiles', () => {
  let trackSpy: ReturnType<typeof vi.spyOn>
  beforeEach(() => {
    resetConfig()
    document.body.innerHTML = ''
    window.history.replaceState({}, '', 'https://example.com/')
    configure({ domain: 'example.com' })
    trackSpy = vi.spyOn(track, 'track').mockImplementation(() => {})
    enableFiles(['pdf', 'zip'])
  })
  afterEach(() => { trackSpy.mockRestore() })

  it('tracks a download for a matching extension', () => {
    clickLink('https://example.com/whitepaper.pdf')
    expect(trackSpy).toHaveBeenCalledWith('File Download', {
      props: { url: 'https://example.com/whitepaper.pdf', extension: 'pdf' },
    })
  })

  it('ignores non-matching extensions', () => {
    clickLink('https://example.com/page.html')
    expect(trackSpy).not.toHaveBeenCalled()
  })
})
