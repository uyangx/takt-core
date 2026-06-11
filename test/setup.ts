// Node.js v26 exposes an experimental (non-functional) localStorage global that
// shadows jsdom's implementation. Restore jsdom's localStorage so tests work.
const dom = (globalThis as unknown as { jsdom?: { window?: { localStorage?: Storage } } }).jsdom
if (dom?.window?.localStorage) {
  Object.defineProperty(globalThis, 'localStorage', {
    value: dom.window.localStorage,
    writable: true,
    configurable: true,
  })
}
