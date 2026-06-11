export interface ConsentStore {
  isOptedOut(): boolean
  optOut(): void
  optIn(): void
}
