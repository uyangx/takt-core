export interface ClickSource {
  /** Register a handler called with the resolved anchor element and original event.
   *  Returns a disposer function. */
  onAnchorClick(cb: (a: HTMLAnchorElement, e: Event) => void): () => void
}
