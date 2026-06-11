export interface NavigationProvider {
  /** Register a navigation callback. Returns a disposer function. */
  onNavigate(cb: () => void): () => void
}
