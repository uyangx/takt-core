export interface Config {
  domain: string
  endpoint: string
  respectDnt: boolean
  excludeLocalhost: boolean
}

let current: Config | null = null

export function configure(opts: Partial<Config>): Config {
  current = {
    domain: opts.domain || location.hostname,
    endpoint: opts.endpoint ?? '/api/event',
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
