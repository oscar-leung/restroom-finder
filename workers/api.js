/**
 * Gotta Go backend — Cloudflare Worker (free tier).
 *
 * The first real backend for the app. Deliberately tiny: cross-user
 * condition reports and visit counts, aggregated per bathroom, on
 * Workers KV. This unlocks ROADMAP items #17/#18 (cross-user state)
 * without accounts — the anonymous per-device visitor id is enough
 * for rate limiting and dedupe.
 *
 * Endpoints (all JSON, CORS-open to the app origins):
 *   POST /api/reports          {bathroomId, type, visitorId}
 *   GET  /api/reports/:id      → {counts: {clean: n, dirty: n, ...},
 *                                 latest: [{type, ts}...]}  (last 24h)
 *   POST /api/visits           {bathroomId, visitorId}
 *   GET  /api/popularity?ids=a,b,c → {a: 12, b: 3}  (all-time GO taps)
 *   GET  /api/health           → {ok: true}
 *
 * Storage layout (KV namespace REPORTS):
 *   report:<bathroomId>   → JSON array of {type, ts, v} (capped 200)
 *   visits:<bathroomId>   → integer count
 *   seen:<bathroomId>:<visitorId>:<type> → "1" with 30-min TTL (rate limit)
 *
 * Deploy: see workers/RUNBOOK.md. Until VITE_API_BASE is set in the
 * app build, no client ever calls this — it can be deployed and tested
 * in isolation.
 */

const REPORT_TYPES = new Set([
  "clean", "dirty", "needs_supplies", "out_of_order", "not_here",
]);

const MAX_REPORTS_PER_BATHROOM = 200;
const RATE_LIMIT_TTL_S = 30 * 60;

// CORS: the PWA origins. Add your custom domain when you have one.
const ALLOWED_ORIGINS = new Set([
  "https://oscar-leung.github.io",
  "http://localhost:5173",
  "http://localhost:5199",
]);

function corsHeaders(origin) {
  const allowed = ALLOWED_ORIGINS.has(origin) ? origin : "https://oscar-leung.github.io";
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };
}

function json(data, status, origin) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
  });
}

// Bathroom ids come from the client (osm-node-42, refuge-17, …).
// Constrain to a safe charset + length so KV keys can't be abused.
function safeId(id) {
  return typeof id === "string" && /^[\w.:-]{1,80}$/.test(id) ? id : null;
}
function safeVisitor(v) {
  return typeof v === "string" && /^[\w.-]{1,60}$/.test(v) ? v : null;
}

async function handleReportPost(request, env, origin) {
  let body;
  try { body = await request.json(); } catch { return json({ error: "bad json" }, 400, origin); }
  const id = safeId(body.bathroomId);
  const visitor = safeVisitor(body.visitorId);
  const type = REPORT_TYPES.has(body.type) ? body.type : null;
  if (!id || !visitor || !type) return json({ error: "bad fields" }, 400, origin);

  // Rate limit: one report per (bathroom, visitor, type) per 30 min
  const seenKey = `seen:${id}:${visitor}:${type}`;
  if (await env.REPORTS.get(seenKey)) {
    return json({ rateLimited: true }, 429, origin);
  }
  await env.REPORTS.put(seenKey, "1", { expirationTtl: RATE_LIMIT_TTL_S });

  const key = `report:${id}`;
  const list = JSON.parse((await env.REPORTS.get(key)) || "[]");
  list.unshift({ type, ts: new Date().toISOString(), v: visitor.slice(0, 12) });
  await env.REPORTS.put(key, JSON.stringify(list.slice(0, MAX_REPORTS_PER_BATHROOM)));
  return json({ ok: true, total: Math.min(list.length, MAX_REPORTS_PER_BATHROOM) }, 200, origin);
}

async function handleReportGet(id, env, origin) {
  const list = JSON.parse((await env.REPORTS.get(`report:${id}`)) || "[]");
  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  const recent = list.filter((r) => new Date(r.ts).getTime() > cutoff);
  const counts = {};
  for (const r of recent) counts[r.type] = (counts[r.type] || 0) + 1;
  // latest of each type, newest first (mirrors the client's getBathroomState)
  const seen = new Set();
  const latest = [];
  for (const r of recent) {
    if (!seen.has(r.type)) {
      seen.add(r.type);
      latest.push({ type: r.type, ts: r.ts });
    }
  }
  return json({ counts, latest }, 200, origin);
}

async function handleVisitPost(request, env, origin) {
  let body;
  try { body = await request.json(); } catch { return json({ error: "bad json" }, 400, origin); }
  const id = safeId(body.bathroomId);
  const visitor = safeVisitor(body.visitorId);
  if (!id || !visitor) return json({ error: "bad fields" }, 400, origin);

  // Light rate limit: one counted GO per visitor per bathroom per 30 min
  const seenKey = `seen:${id}:${visitor}:visit`;
  if (await env.REPORTS.get(seenKey)) return json({ ok: true, deduped: true }, 200, origin);
  await env.REPORTS.put(seenKey, "1", { expirationTtl: RATE_LIMIT_TTL_S });

  const key = `visits:${id}`;
  const count = parseInt((await env.REPORTS.get(key)) || "0", 10) + 1;
  await env.REPORTS.put(key, String(count));
  return json({ ok: true, count }, 200, origin);
}

async function handlePopularity(url, env, origin) {
  const ids = (url.searchParams.get("ids") || "")
    .split(",")
    .map((s) => safeId(s.trim()))
    .filter(Boolean)
    .slice(0, 50); // cap fan-out
  const out = {};
  await Promise.all(
    ids.map(async (id) => {
      const v = await env.REPORTS.get(`visits:${id}`);
      if (v) out[id] = parseInt(v, 10);
    })
  );
  return json(out, 200, origin);
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const url = new URL(request.url);
    const { pathname } = url;

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    if (pathname === "/api/health") return json({ ok: true }, 200, origin);

    if (pathname === "/api/reports" && request.method === "POST") {
      return handleReportPost(request, env, origin);
    }
    const reportMatch = pathname.match(/^\/api\/reports\/([\w.:-]{1,80})$/);
    if (reportMatch && request.method === "GET") {
      return handleReportGet(reportMatch[1], env, origin);
    }
    if (pathname === "/api/visits" && request.method === "POST") {
      return handleVisitPost(request, env, origin);
    }
    if (pathname === "/api/popularity" && request.method === "GET") {
      return handlePopularity(url, env, origin);
    }

    return json({ error: "not found" }, 404, origin);
  },
};
