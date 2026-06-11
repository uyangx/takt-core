import type { EnvironmentProvider } from '../../application/ports/EnvironmentProvider'

export class WindowEnvironmentProvider implements EnvironmentProvider {
  hostname(): string { return location.hostname }
  url(): string { return location.href }
  referrer(): string { return document.referrer }
  width(): number { return window.innerWidth || 0 }
}
