# @vskstudio/takt-core

## 0.2.0

### Minor Changes

- Privacy hardening and new features.

  - **URL scrubbing**: query string and hash are stripped from every URL (page, referrer, autocaptured link destinations) by default. Configurable via `trackQuery`, a `queryParams` allowlist, or a custom `scrubUrl` function.
  - **Input validation**: props are coerced to strings, capped (30 keys, 64-char keys, 1024-char values); revenue is dropped unless the amount and 3-letter currency are well-formed. Clamps warn once in the console.
  - **New options**: `enabled`, `debug`, and `sampleRate`.
  - **SPA**: `replaceState` and `hashchange` are now tracked in addition to `pushState`/`popstate`.
  - **Idempotent `init()`**: re-initialising disposes the previous instance's listeners.
  - **Autocapture**: `mailto:` / `tel:` and other non-http links are skipped; link destination URLs are scrubbed.
  - Expanded localhost/private-IP detection (`::1`, `0.0.0.0`).
  - Removed dead transport adapters.

## 0.1.1

### Patch Changes

- Publication via npm Trusted Publishing / token CI (pas de changement de code).

## 0.1.0

### Minor Changes

- c18348c: Première version publique de `@vskstudio/takt-core` : SDK d'analytics minimaliste et respectueux de la vie privée, en architecture hexagonale.

  - `createTakt(config)` — instance avec `track`, `pageview`, `optOut`/`optIn`, et `enableSpa`/`enableOutbound`/`enableFiles` qui renvoient des disposers.
  - Helpers top-level `init`/`track`/`pageview`/`optOut`/`optIn` sur une instance par défaut.
  - Snippet IIFE ≤ 1 kB gzip avec configuration `data-*`, file d'attente de bootstrap et `window.takt`.
  - Respect de l'opt-out, de Do Not Track, et exclusion localhost/IP privées par défaut.
