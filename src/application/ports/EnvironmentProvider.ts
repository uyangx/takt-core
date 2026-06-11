export interface EnvironmentProvider {
  hostname(): string
  url(): string
  referrer(): string
  width(): number
}
