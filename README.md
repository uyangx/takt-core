# @vskstudio/takt-core

Tiny, privacy-friendly analytics SDK for [Takt](https://github.com/uyangx/takt).

- **Zero dependencies**, tree-shakeable ESM module.
- **≤ 1 kB gzip** drop-in snippet.
- **Privacy first**: honours opt-out, Do Not Track, and excludes localhost/private IPs by default.
- **Hexagonal core**: a pure domain wrapped in ports & adapters — easy to test, easy to extend.

## Snippet (no build step)

```html
<script defer src="https://cdn.jsdelivr.net/npm/@vskstudio/takt-core/dist/takt.js" data-domain="example.com"></script>
```

> Pin a version in production, e.g. `@vskstudio/takt-core@0.1.0`. jsDelivr and unpkg both serve the snippet straight from npm — no extra hosting required.

Then, anywhere on the page:

```js
window.takt('Signup', { props: { plan: 'pro' } })
```

Calls made before the script finishes loading are queued and replayed — install a tiny stub first if you need that:

```html
<script>
  window.takt = window.takt || function () { (window.takt.q = window.takt.q || []).push(arguments) }
</script>
```

### `data-*` options

| Attribute | Effect | Default |
| --- | --- | --- |
| `data-domain` | Site identifier sent with every event | `location.hostname` |
| `data-endpoint` | Ingestion endpoint | `/api/event` |
| `data-outbound` | Auto-track outbound link clicks (presence flag) | off |
| `data-files` | Auto-track file downloads (presence flag) | off |
| `data-exclude-localhost="false"` | Track localhost / private IPs | excluded |

The snippet always respects Do Not Track and always strips the query string and hash from URLs. For per-query allowlisting, a custom scrubber, or to keep the query, use the npm build (`trackQuery` / `queryParams` / `scrubUrl` below).

## npm

```bash
pnpm add @vskstudio/takt-core
```

### Quick start — default instance

```ts
import { init, track, pageview } from '@vskstudio/takt-core'

init({ domain: 'example.com', outbound: true, files: true })

track('Signup', {
  props: { plan: 'pro' },
  revenue: { amount: '29.00', currency: 'EUR' },
})
```

`init()` creates a single shared instance, fires an automatic pageview, and wires SPA navigation. `track`, `pageview`, `optOut`, and `optIn` delegate to it.

### Instance API — `createTakt`

For full control (multiple instances, no globals, explicit teardown), construct an instance directly:

```ts
import { createTakt } from '@vskstudio/takt-core'

const takt = createTakt({ domain: 'example.com', endpoint: '/api/event' })

takt.pageview()
takt.track('Signup', { props: { plan: 'pro' } })

// Each enableX returns a disposer for teardown.
const stopSpa = takt.enableSpa()
const stopOutbound = takt.enableOutbound()
const stopFiles = takt.enableFiles(['pdf', 'zip', 'csv'])

// later…
stopSpa()
stopOutbound()
stopFiles()
```

`createTakt()` is a pure factory (no side effects until you call a method), so it tree-shakes cleanly.

### Configuration

`init()` and `createTakt()` accept the same options:

| Option | Type | Default | Effect |
| --- | --- | --- | --- |
| `domain` | `string` | `location.hostname` | Site identifier sent with every event |
| `endpoint` | `string` | `/api/event` | Ingestion endpoint |
| `enabled` | `boolean` | `true` | Master switch — when `false`, nothing is sent |
| `debug` | `boolean` | `false` | Log each payload to the console before sending |
| `sampleRate` | `number` | `1` | Keep this fraction of events (e.g. `0.25` ≈ 25%) |
| `respectDnt` | `boolean` | `true` | Suppress events when Do Not Track is on |
| `excludeLocalhost` | `boolean` | `true` | Suppress events on localhost / private IPs |
| `trackQuery` | `boolean` | `false` | Keep the full query string and hash on URLs |
| `queryParams` | `string[]` | — | Allowlist: keep only these query params, drop the rest |
| `scrubUrl` | `(url: string) => string` | — | Custom scrubber; overrides `trackQuery` / `queryParams` |

### Privacy

By default the query string and hash are stripped from every URL (page, referrer, and autocaptured link destinations) before sending — secrets in `?token=…` or `#access_token=…` never leave the browser. Opt back in with `trackQuery: true`, narrow it with a `queryParams` allowlist, or take full control with `scrubUrl`. Props and revenue are sanitized too: props are coerced to strings, capped (30 keys, 64-char keys, 1024-char values), and revenue is dropped unless the amount and 3-letter currency are well-formed.

```ts
import { optOut, optIn } from '@vskstudio/takt-core'

optOut() // sets localStorage `takt_ignore` = '1'; no events are sent
optIn()  // resumes tracking
```

Events are suppressed, in order, when: the visitor has opted out, **or** Do Not Track is enabled (`respectDnt`), **or** the host is localhost / a private IP (`excludeLocalhost`), **or** the event is dropped by `sampleRate`.

## Wire payload contract

Every event is posted to the endpoint as a compact JSON object. The keys are frozen — the [Takt backend](https://github.com/uyangx/takt) ingestion depends on them:

| Key | Meaning |
| --- | --- |
| `n` | event name (`pageview` for pageviews) |
| `d` | domain |
| `u` | URL (query + hash stripped by default) |
| `r` | referrer (query + hash stripped by default) |
| `w` | viewport width |
| `p` | props (object, omitted if empty) |
| `$` | revenue `{ a: amount, c: currency }` (currency uppercased) |

## Architecture

`@vskstudio/takt-core` follows a hexagonal (ports & adapters) layout:

```
domain/          Pure business core, zero I/O. Value objects (EventName, Props,
                 Revenue, AnalyticsEvent), payload mapping, and the URL scrubber.
application/      Use cases: the Analytics service, the TrackingPolicy (consent +
                 sampling), and autocapture trackers — depending only on small
                 single-method port interfaces.
infrastructure/   Driven adapters: a resilient fetch/beacon transport, localStorage
                 consent, and browser providers (DNT, environment, history, clicks).
composition/      createTakt() factory, the ESM entry, and the snippet adapter.
```

The domain never reaches outward; adapters are injected at the composition root (`createTakt`). This keeps the core testable with fakes and lets you swap transports or storage without touching business logic.

## License

MIT
