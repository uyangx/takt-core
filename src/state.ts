export interface Config {
  domain: string
  endpoint: string
  auto: boolean
  outbound: boolean
  files: boolean
  fileExtensions: string[]
  respectDnt: boolean
  excludeLocalhost: boolean
}

const DEFAULT_FILE_EXTENSIONS = [
  'pdf', 'zip', 'dmg', 'xlsx', 'csv', 'doc', 'docx', 'ppt', 'pptx',
  'rar', '7z', 'gz', 'mp3', 'mp4', 'wav', 'avi', 'mov',
]

let current: Config | null = null

export function configure(opts: Partial<Config>): Config {
  current = {
    domain: opts.domain || location.hostname,
    endpoint: opts.endpoint ?? '/api/event',
    auto: opts.auto ?? true,
    outbound: opts.outbound ?? false,
    files: opts.files ?? false,
    fileExtensions: opts.fileExtensions ?? DEFAULT_FILE_EXTENSIONS,
    respectDnt: opts.respectDnt ?? true,
    excludeLocalhost: opts.excludeLocalhost ?? true,
  }
  return current
}

export function getConfig(): Config | null {
  return current
}

export function resetConfig(): void {
  current = null
}
