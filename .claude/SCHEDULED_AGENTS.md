# Scheduled Agent Runs

Each agent in `.claude/agents/` can be invoked one-off (e.g. "have the
marketing-agent write a TikTok script") OR on a recurring schedule via
the Claude Code `/schedule` skill.

This file documents the recommended cadence per agent and the prompt
each scheduled run should use. Replace `oscar-leung` with your handle
where it appears.

> **Setup**: in any Claude Code session, run `/schedule` and paste the
> trigger config below for each agent you want recurring.

---

## marketing-agent — weekly Monday 9am

**Trigger name**: `gg-marketing-weekly`

**Cron**: `0 9 * * 1` (Monday 9am local)

**Prompt**:
```
You are the marketing-agent. Read /Users/oscarleung/restroom-finder/.claude/agents/marketing-agent.md
to refresh your role.

Pull the last week of GA4 data (or note if VITE_GA_ID is unset and
nothing's wired). Then produce:

1. ONE prioritized action this week: a specific post, outreach email,
   or community engagement. Be concrete.
2. ONE thing to STOP doing (something that didn't work last week).
3. ONE experiment idea — a hypothesis we could A/B test in the app
   that the marketing-agent thinks would move the GO-click rate.

Save to /Users/oscarleung/restroom-finder/.claude/inbox/marketing-{date}.md.
Concise. Don't pad.
```

---

## analytics-agent — daily 8am

**Trigger name**: `gg-analytics-daily`

**Cron**: `0 8 * * *`

**Prompt**:
```
You are the analytics-agent. Pull the last 24h of GA4 data for the
Gotta Go property. If VITE_GA_ID isn't set, note that clearly and stop.

Produce a 5-line summary:
- Visits / unique users
- GO-click rate
- Top 3 sources of traffic
- Anomalies (events spiking or vanishing vs prior 7d average)
- One question worth investigating

Save to /Users/oscarleung/restroom-finder/.claude/inbox/analytics-{date}.md.
```

---

## seo-agent — weekly Wednesday 10am

**Trigger name**: `gg-seo-weekly`

**Cron**: `0 10 * * 3`

**Prompt**:
```
You are the seo-agent. Read SEO.md for the current strategy.

This week, do ONE of (rotate each week):

W1: Identify 5 long-tail keywords we should rank for and aren't.
W2: Draft a programmatic landing page for the next priority city
    (look at GA4 "Country" dimension to pick the city with high traffic
    but no landing page yet).
W3: Audit our schema.org markup — is everything that should be
    structured-data, structured-data?
W4: Find 3 backlink opportunities (sites that link to similar tools).

Save to /Users/oscarleung/restroom-finder/.claude/inbox/seo-{date}.md.
```

---

## ab-testing-agent — weekly Friday 4pm

**Trigger name**: `gg-ab-weekly`

**Cron**: `0 16 * * 5`

**Prompt**:
```
You are the ab-testing-agent. Read src/utils/featureFlags.js to see
which flags are live.

For each flag with rollout > 0:
- Pull GA4 `experiment_view` count + conversion event count per variant
- Calculate variant lift, sample size, and rough p-value
- Recommend: keep, kill, or extend the test

If a test is significant and positive, queue a PR (don't open it yet)
to bump rollout to 100% and remove the flag.

Save to /Users/oscarleung/restroom-finder/.claude/inbox/ab-{date}.md.
```

---

## software-engineer-agent — on-demand only

This one runs when you invoke it explicitly — no schedule. Use it for
data-source additions, dependency upgrades, Capacitor bumps, perf
audits.

---

## frontend-agent — on-demand only

Invoked when a UX/visual issue is spotted — no schedule.

---

## How outputs flow

All scheduled agents drop their reports into:
```
/Users/oscarleung/restroom-finder/.claude/inbox/
```

Read them in your morning routine. Things worth acting on get an
issue / PR. Things that aren't get archived (or just left — they
won't pile up if cadence is right).

`.claude/inbox/` is **gitignored** — these are personal notes, not
shared docs.
