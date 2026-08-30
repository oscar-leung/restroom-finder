import { beforeEach } from 'vitest'

// In-memory localStorage — the services guard every access with
// try/catch, but tests want real read-back behavior.
function makeStorage() {
  let store = {}
  return {
    getItem: (k) => (k in store ? store[k] : null),
    setItem: (k, v) => { store[k] = String(v) },
    removeItem: (k) => { delete store[k] },
    clear: () => { store = {} },
    get length() { return Object.keys(store).length },
    key: (i) => Object.keys(store)[i] ?? null,
  }
}

globalThis.localStorage = makeStorage()

beforeEach(() => {
  globalThis.localStorage.clear()
})
