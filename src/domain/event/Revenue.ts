import { warnOnce } from '../util/warn'

const AMOUNT_RE = /^\d+(\.\d{1,2})?$/
const CURRENCY_RE = /^[A-Za-z]{3}$/

export class Revenue {
  readonly amount: string
  readonly currency: string

  constructor(amount: string, currency: string) {
    this.amount = amount
    this.currency = currency
  }

  // Validates amount + 3-letter currency; returns undefined (warns) when malformed.
  static parse(amount: unknown, currency: unknown): Revenue | undefined {
    if (typeof amount !== 'string' || !AMOUNT_RE.test(amount)) {
      warnOnce('revenue dropped: amount must match \\d+(.\\d{1,2})?')
      return undefined
    }
    if (typeof currency !== 'string' || !CURRENCY_RE.test(currency)) {
      warnOnce('revenue dropped: currency must be a 3-letter code')
      return undefined
    }
    return new Revenue(amount, currency)
  }

  toWire(): { a: string; c: string } {
    return { a: this.amount, c: this.currency.toUpperCase() }
  }
}
