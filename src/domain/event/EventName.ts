/** Value object: a validated, non-empty, trimmed event name. */
export class EventName {
  readonly value: string

  constructor(raw: string) {
    if (typeof raw !== 'string') throw new Error('EventName must be a string')
    const trimmed = raw.trim()
    if (!trimmed) throw new Error('EventName cannot be empty')
    this.value = trimmed
  }

  /** Returns true when the name is reserved for internal use and cannot be used for custom tracking. */
  isReserved(): boolean {
    return this.value === 'pageview'
  }
}
