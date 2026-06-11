import { describe, it, expect } from 'vitest'
import { OutboundLinkTracker } from '../../src/application/autocapture/OutboundLinkTracker'
import { FileDownloadTracker } from '../../src/application/autocapture/FileDownloadTracker'
import type { ClickSource } from '../../src/application/ports/ClickSource'
import type { EnvironmentProvider } from '../../src/application/ports/EnvironmentProvider'
import type { TrackOptions } from '../../src/application/Analytics'

// --- Fakes ---
function fakeClick() {
  let cb: ((a: HTMLAnchorElement, e: Event) => void) | null = null
  const source: ClickSource = {
    onAnchorClick: (handler) => { cb = handler; return () => { cb = null } },
  }
  return { source, trigger: (a: HTMLAnchorElement) => cb?.(a, new Event('click')) }
}

function fakeEnv(hostname = 'example.com'): EnvironmentProvider {
  return {
    hostname: () => hostname,
    url: () => `https://${hostname}/`,
    referrer: () => '',
    width: () => 1280,
  }
}

function link(href: string): HTMLAnchorElement {
  const a = document.createElement('a')
  a.href = href
  return a
}

describe('OutboundLinkTracker', () => {
  it('fires Outbound Link: Click for a cross-host anchor', () => {
    const { source, trigger } = fakeClick()
    const calls: [string, TrackOptions?][] = []
    const tracker = new OutboundLinkTracker(source, fakeEnv('example.com'), (n, o) => calls.push([n, o]))
    tracker.enable()
    trigger(link('https://other.com/page'))
    expect(calls).toHaveLength(1)
    expect(calls[0][0]).toBe('Outbound Link: Click')
    expect(calls[0][1]?.props?.url).toBe('https://other.com/page')
  })

  it('ignores same-host anchors', () => {
    const { source, trigger } = fakeClick()
    const calls: [string, TrackOptions?][] = []
    new OutboundLinkTracker(source, fakeEnv('example.com'), (n, o) => calls.push([n, o])).enable()
    trigger(link('https://example.com/internal'))
    expect(calls).toHaveLength(0)
  })

  it('ignores anchors with no href', () => {
    const { source, trigger } = fakeClick()
    const calls: [string, TrackOptions?][] = []
    new OutboundLinkTracker(source, fakeEnv('example.com'), (n, o) => calls.push([n, o])).enable()
    trigger(document.createElement('a')) // no href
    expect(calls).toHaveLength(0)
  })
})

describe('FileDownloadTracker', () => {
  it('fires File Download for a matching extension', () => {
    const { source, trigger } = fakeClick()
    const calls: [string, TrackOptions?][] = []
    new FileDownloadTracker(source, (n, o) => calls.push([n, o]), ['pdf', 'zip']).enable()
    trigger(link('https://example.com/report.pdf'))
    expect(calls).toHaveLength(1)
    expect(calls[0][0]).toBe('File Download')
    expect(calls[0][1]?.props?.extension).toBe('pdf')
    expect(calls[0][1]?.props?.url).toContain('report.pdf')
  })

  it('ignores non-matching extensions', () => {
    const { source, trigger } = fakeClick()
    const calls: [string, TrackOptions?][] = []
    new FileDownloadTracker(source, (n, o) => calls.push([n, o]), ['pdf']).enable()
    trigger(link('https://example.com/page.html'))
    expect(calls).toHaveLength(0)
  })

  it('is case-insensitive for extension matching', () => {
    const { source, trigger } = fakeClick()
    const calls: [string, TrackOptions?][] = []
    new FileDownloadTracker(source, (n, o) => calls.push([n, o]), ['pdf']).enable()
    trigger(link('https://example.com/Report.PDF'))
    expect(calls).toHaveLength(1)
  })

  it('uses DEFAULT_FILE_EXTENSIONS when none provided', () => {
    const { source, trigger } = fakeClick()
    const calls: [string, TrackOptions?][] = []
    new FileDownloadTracker(source, (n, o) => calls.push([n, o])).enable()
    trigger(link('https://example.com/archive.zip'))
    expect(calls).toHaveLength(1)
  })
})
