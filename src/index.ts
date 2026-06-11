import { configure, type Config } from './state'
import { pageview, track } from './track'
import { enableSpa } from './spa'
import { enableOutbound } from './autocapture/outbound'
import { enableFiles } from './autocapture/files'
import { optOut, optIn } from './privacy'

export function init(opts: Partial<Config>): void {
  const cfg = configure(opts)
  if (cfg.outbound) enableOutbound()
  if (cfg.files) enableFiles()
  if (cfg.auto) {
    enableSpa()
    pageview()
  }
}

export { track, pageview, optOut, optIn }
export type { Config } from './state'
export type { TrackOptions, Revenue, Payload } from './payload'
