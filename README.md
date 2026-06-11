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
| `data-respect-dnt="false"` | Track even when DNT is on | respected |

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

### Privacy

```ts
import { optOut, optIn } from '@vskstudio/takt-core'

optOut() // sets localStorage `takt_ignore` = '1'; no events are sent
optIn()  // resumes tracking
```

Events are suppressed, in order, when: the visitor has opted out, **or** Do Not Track is enabled (`respectDnt`), **or** the host is localhost / a private IP (`excludeLocalhost`).

## Wire payload contract

Every event is posted to the endpoint as a compact JSON object. The keys are frozen — the [Takt backend](https://github.com/uyangx/takt) ingestion depends on them:

| Key | Meaning |
| --- | --- |
| `n` | event name (`pageview` for pageviews) |
| `d` | domain |
| `u` | URL |
| `r` | referrer |
| `w` | viewport width |
| `p` | props (object, omitted if empty) |
| `$` | revenue `{ a: amount, c: currency }` (currency uppercased) |

## Architecture

`@vskstudio/takt-core` follows a hexagonal (ports & adapters) layout:

```
domain/          Pure business core, zero I/O.
                 Value objects (EventName, Props, Revenue, AnalyticsEvent),
                 payload mapping, and the TrackingPolicy (consent rules).
application/      Use cases: the Analytics service + autocapture trackers,
                 depending only on small single-method port interfaces.
infrastructure/   Driven adapters: beacon/fetch transport, localStorage consent,
                 and browser providers (DNT, environment, history, clicks).
composition/      createTakt() factory, the ESM entry, and the snippet adapter.
```

The domain never reaches outward; adapters are injected at the composition root (`createTakt`). This keeps the core testable with fakes and lets you swap transports or storage without touching business logic.

## License

MIT
