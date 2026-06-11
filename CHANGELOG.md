# @vskstudio/takt-core

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
