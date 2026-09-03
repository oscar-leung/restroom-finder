import { describe, it, expect, beforeEach } from 'vitest'
import worker from '../workers/api.js'

// Minimal in-memory KV double. TTLs are recorded but not enforced —
// tests that care about expiry manipulate the store directly.
function makeKV() {
  const store = new Map()
  return {
    store,
    async get(k) { return store.has(k) ? store.get(k) : null },
    async put(k, v) { store.set(k, v) },
  }
}

let env
beforeEach(() => { env = { REPORTS: makeKV() } })

const BASE = 'https://api.test'
const ORIGIN = 'https://oscar-leung.github.io'

function post(path, body, origin = ORIGIN) {
  return worker.fetch(
    new Request(BASE + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Origin: origin },
      body: JSON.stringify(body),
    }),
    env
  )
}
function get(path, origin = ORIGIN) {
  return worker.fetch(new Request(BASE + path, { headers: { Origin: origin } }), env)
}

describe('worker: health + routing', () => {
  it('answers health', async () => {
    const res = await get('/api/health')
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ ok: true })
  })

  it('404s unknown paths', async () => {
    const res = await get('/api/nope')
    expect(res.status).toBe(404)
  })

  it('handles CORS preflight', async () => {
    const res = await worker.fetch(
      new Request(BASE + '/api/reports', { method: 'OPTIONS', headers: { Origin: ORIGIN } }),
      env
    )
    expect(res.status).toBe(204)
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe(ORIGIN)
  })

  it('falls back to the prod origin for unknown origins', async () => {
    const res = await get('/api/health', 'https://evil.example')
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('https://oscar-leung.github.io')
  })
})

describe('worker: reports', () => {
  it('stores a report and aggregates it', async () => {
    const res = await post('/api/reports', {
      bathroomId: 'osm-node-42', type: 'clean', visitorId: 'v-abc',
    })
    expect(res.status).toBe(200)

    const agg = await (await get('/api/reports/osm-node-42')).json()
    expect(agg.counts).toEqual({ clean: 1 })
    expect(agg.latest[0].type).toBe('clean')
  })

  it('rejects bad types and malformed ids', async () => {
    expect((await post('/api/reports', { bathroomId: 'x', type: 'sparkling', visitorId: 'v' })).status).toBe(400)
    expect((await post('/api/reports', { bathroomId: 'a b<script>', type: 'clean', visitorId: 'v' })).status).toBe(400)
    expect((await post('/api/reports', { bathroomId: 'x'.repeat(999), type: 'clean', visitorId: 'v' })).status).toBe(400)
  })

  it('rate-limits repeat (bathroom, visitor, type) within the TTL window', async () => {
    await post('/api/reports', { bathroomId: 'b1', type: 'dirty', visitorId: 'v-1' })
    const second = await post('/api/reports', { bathroomId: 'b1', type: 'dirty', visitorId: 'v-1' })
    expect(second.status).toBe(429)
    // different visitor is fine
    const other = await post('/api/reports', { bathroomId: 'b1', type: 'dirty', visitorId: 'v-2' })
    expect(other.status).toBe(200)
    const agg = await (await get('/api/reports/b1')).json()
    expect(agg.counts.dirty).toBe(2)
  })

  it('only counts the last 24h in aggregates', async () => {
    const old = { type: 'dirty', ts: new Date(Date.now() - 48 * 3600e3).toISOString(), v: 'v' }
    env.REPORTS.store.set('report:b2', JSON.stringify([old]))
    const agg = await (await get('/api/reports/b2')).json()
    expect(agg.counts).toEqual({})
  })

  it('truncates the visitor id stored with each report', async () => {
    await post('/api/reports', { bathroomId: 'b3', type: 'clean', visitorId: 'v-123456789012345678' })
    const list = JSON.parse(env.REPORTS.store.get('report:b3'))
    expect(list[0].v.length).toBeLessThanOrEqual(12)
  })
})

describe('worker: visits + popularity', () => {
  it('counts a visit and dedupes within the window', async () => {
    const first = await (await post('/api/visits', { bathroomId: 'p1', visitorId: 'v-1' })).json()
    expect(first.count).toBe(1)
    const dup = await (await post('/api/visits', { bathroomId: 'p1', visitorId: 'v-1' })).json()
    expect(dup.deduped).toBe(true)
    await post('/api/visits', { bathroomId: 'p1', visitorId: 'v-2' })

    const pop = await (await get('/api/popularity?ids=p1,p2')).json()
    expect(pop).toEqual({ p1: 2 })
  })

  it('caps popularity fan-out at 50 ids without erroring', async () => {
    const ids = Array.from({ length: 60 }, (_, i) => `id${i}`).join(',')
    const res = await get(`/api/popularity?ids=${ids}`)
    expect(res.status).toBe(200)
  })
})
