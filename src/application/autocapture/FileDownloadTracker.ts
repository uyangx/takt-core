import type { ClickSource } from '../ports/ClickSource'
import type { TrackOptions } from '../Analytics'

export const DEFAULT_FILE_EXTENSIONS = [
  'pdf', 'zip', 'dmg', 'xlsx', 'csv', 'doc', 'docx', 'ppt', 'pptx',
  'rar', '7z', 'gz', 'mp3', 'mp4', 'wav', 'avi', 'mov',
]

/** Fires 'File Download' when an anchor's path ends with a tracked extension. */
export class FileDownloadTracker {
  private readonly exts: string[]

  constructor(
    private readonly clickSource: ClickSource,
    private readonly track: (name: string, opts?: TrackOptions) => void,
    extensions?: string[],
  ) {
    this.exts = extensions && extensions.length > 0 ? extensions : DEFAULT_FILE_EXTENSIONS
  }

  enable(): () => void {
    return this.clickSource.onAnchorClick((a) => {
      if (!a.href) return
      let url: URL
      try { url = new URL(a.href) } catch { return }
      const match = url.pathname.toLowerCase().match(/\.([a-z0-9]+)$/)
      if (!match) return
      const ext = match[1]
      if (!this.exts.includes(ext)) return
      this.track('File Download', { props: { url: a.href, extension: ext } })
    })
  }
}
