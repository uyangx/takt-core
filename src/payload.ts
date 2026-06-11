export interface Revenue { amount: string; currency: string }
export interface TrackOptions { props?: Record<string, string>; revenue?: Revenue }
export interface Payload {
  n: string
  d: string
  u: string
  r: string
  w: number
  p?: Record<string, string>
  $?: { a: string; c: string }
}

export function buildPayload(name: string, domain: string, opts?: TrackOptions): Payload {
  const payload: Payload = {
    n: name,
    d: domain,
    u: location.href,
    r: document.referrer,
    w: window.innerWidth || 0,
  }
  if (opts?.props && Object.keys(opts.props).length > 0) {
    payload.p = opts.props
  }
  if (opts?.revenue) {
    payload.$ = { a: opts.revenue.amount, c: opts.revenue.currency.toUpperCase() }
  }
  return payload
}
