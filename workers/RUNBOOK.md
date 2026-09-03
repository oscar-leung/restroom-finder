# Backend deploy runbook — Cloudflare Workers (free tier)

The worker in `api.js` gives Gotta Go its first cross-user features:
shared condition reports and bathroom popularity. It is **dark by
default** — the app never calls it until `VITE_API_BASE` is set at
build time, so you can deploy and poke it in isolation.

Free-tier limits (plenty for launch): 100k requests/day, 1k KV
writes/day, 100k KV reads/day.

## One-time setup (~10 min, needs your Cloudflare login)

```bash
cd workers
npx wrangler login                       # opens browser
npx wrangler kv namespace create REPORTS # prints an id
# paste that id into wrangler.toml → kv_namespaces.id
npx wrangler deploy                      # prints https://gotta-go-api.<you>.workers.dev
```

Smoke-test it:

```bash
BASE=https://gotta-go-api.<you>.workers.dev
curl $BASE/api/health
curl -X POST $BASE/api/reports -H 'Content-Type: application/json' \
  -d '{"bathroomId":"osm-node-42","type":"clean","visitorId":"v-test-1"}'
curl $BASE/api/reports/osm-node-42
curl -X POST $BASE/api/visits -H 'Content-Type: application/json' \
  -d '{"bathroomId":"osm-node-42","visitorId":"v-test-1"}'
curl "$BASE/api/popularity?ids=osm-node-42"
```

## Turning the app on

Add a repo Actions secret (same place as `VITE_GA_ID`):

- Name: `VITE_API_BASE`
- Value: `https://gotta-go-api.<you>.workers.dev`

…and pass it through in `.github/workflows/deploy.yml`'s build env
(one line, mirroring `VITE_GA_ID`). Redeploy. From then on:

- every condition report ALSO posts to the backend (fire-and-forget,
  never blocks the UI)
- every GO tap posts an anonymous visit
- the details panel merges cross-user reports under "Latest reports"

## What this deliberately does NOT do yet

- No accounts, no PII: the visitor id is the same anonymous
  device-local id used for A/B cohorts, truncated server-side.
- No review sync (needs moderation thinking first).
- No photo storage (needs R2 + content policy).
- Abuse posture: per-(bathroom, visitor, type) 30-min rate limit and a
  200-report cap per bathroom. Good enough while traffic is small;
  revisit with Turnstile if it grows teeth.
