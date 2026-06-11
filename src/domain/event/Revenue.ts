/** Value object: monetary amount + ISO currency code. */
export class Revenue {
  readonly amount: string
  readonly currency: string

  constructor(amount: string, currency: string) {
    this.amount = amount
    this.currency = currency
  }

  /** Wire representation: {a, c} with currency uppercased. */
  toWire(): { a: string; c: string } {
    return { a: this.amount, c: this.currency.toUpperCase() }
  }
}
