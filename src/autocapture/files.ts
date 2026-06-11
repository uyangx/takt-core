import { track } from '../track'
import { getConfig } from '../state'
import { findAnchor } from './dom'

const DEFAULT_FILE_EXTENSIONS = [
  'pdf', 'zip', 'dmg', 'xlsx', 'csv', 'doc', 'docx', 'ppt', 'pptx',
  'rar', '7z', 'gz', 'mp3', 'mp4', 'wav', 'avi', 'mov',
]

let installed = false

export function enableFiles(extensions?: string[]): void {
  if (installed) return
  installed = true
  const exts = extensions && extensions.length > 0 ? extensions : DEFAULT_FILE_EXTENSIONS
  document.addEventListener(
    'click',
    (e) => {
      if (!getConfig()) return
      const a = findAnchor(e.target)
      if (!a || !a.href) return
      let url: URL
      try { url = new URL(a.href) } catch { return }
      const match = url.pathname.toLowerCase().match(/\.([a-z0-9]+)$/)
      if (!match) return
      const ext = match[1]
      if (!exts.includes(ext)) return
      track('File Download', { props: { url: a.href, extension: ext } })
    },
    true,
  )
}
