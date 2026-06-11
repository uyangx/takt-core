import { configure, type Config } from './state'
import { pageview, track } from './track'
import { enableSpa } from './spa'
import { enableOutbound } from './autocapture/outbound'
import { enableFiles } from './autocapture/files'
import { optOut, optIn } from './privacy'

export interface InitOptions extends Config {
  auto?: boolean
  outbound?: boolean
  files?: boolean
  fileExtensions?: string[]
}

export function init(opts: Partial<InitOptions>): void {
  configure(opts)
  if (opts.outbound) enableOutbound()
  if (opts.files) enableFiles(opts.fileExtensions)
  if (opts.auto ?? true) {
    enableSpa()
    pageview()
  }
}

export { track, pageview, optOut, optIn }
export type { Config } from './state'
export type { TrackOptions, Revenue, Payload } from './payload'
