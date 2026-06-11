/** Value object: a string→string map with empty values dropped. */
export class Props {
  private readonly map: Record<string, string>

  constructor(raw?: Record<string, string>) {
    const cleaned: Record<string, string> = {}
    if (raw) {
      for (const [k, v] of Object.entries(raw)) {
        if (v !== '') cleaned[k] = v
      }
    }
    this.map = cleaned
  }

  isEmpty(): boolean {
    return Object.keys(this.map).length === 0
  }

  /** Returns the wire representation, or undefined when empty (key must be omitted). */
  toWire(): Record<string, string> | undefined {
    return this.isEmpty() ? undefined : { ...this.map }
  }
}
