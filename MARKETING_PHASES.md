# Gotta Go — Marketing Phases

Live URL: https://oscar-leung.github.io/restroom-finder/

A practical, tactic-level plan derived from how 5 utility/discovery apps actually grew from a "find-the-nearest-X" starting point. Most marketing actions produce nothing. The list below is ordered by the likelihood of working for *this specific product* (a free, no-account-required public restroom finder).

---

## Research: what actually worked for comparable apps

### 1. GasBuddy (find cheap gas → 90M+ downloads)
- **Crowdsourced data as the hook.** Launched as GasPriceWatch.com in 2000 with user-reported prices. Marketing was the data itself — no other source had it.
- **Local TV news segments.** Founders pitched local news during gas-price spikes (2005, 2008, 2011). Free airtime in dozens of metros because it was a "consumer saves money" story tied to a current event.
- **Programmatic city pages** (`/usa/<state>/<city>`) ranked for "cheap gas in <city>" on Google for a decade before they went app-first.
- **Points/leaderboard for reporters.** Top reporters got jackets and gift cards. Cost: ~$50/winner. Output: a self-sustaining data moat.

### 2. AllTrails (find a hike → 60M+ users)
- **SEO-first, app-second.** Every trail got a URL with photos, elevation profile, reviews. They acquired the domain from a defunct site in 2010 and kept the existing trail URLs — kept the SEO juice.
- **REI partnership** in 2013–2015 — REI promoted AllTrails to its members; AllTrails embedded REI store locator. B2B trade, no money changed hands.
- **/near-me and /best-trails-in-<city>** pages. Still their #1 traffic source.
- **Pro tier launched only after free hit critical mass** (~10M users before paywalling offline maps).

### 3. Citymapper (transit directions → 50M users)
- **Single-city launch.** London only for the first 2 years. Refused to expand until London was dominant. Word-of-mouth in a dense commuter city beat any ad spend.
- **Press hook: "we're better than Google Maps."** Direct comparison screenshots in TechCrunch, The Verge. Founders hand-pitched journalists.
- **r/london, r/AskLondon, r/CasualUK** — early team posted answers to "best way from X to Y" with Citymapper screenshots. Banned a few times; mostly tolerated because it answered the question.
- **Easter eggs** (rain mode, catapult mode, teleport). Each got a TechCrunch / Gizmodo writeup. Free press by being weird.

### 4. Flush Toilet Finder (most direct comparator → 10M+ downloads)
- **App store SEO is the entire strategy.** Title literally is "Flush - Toilet Finder & Map." Ranked #1 for "toilet" and "bathroom" on iOS App Store for years.
- **Travel blogger seeding.** Reached out to travel bloggers (Nomadic Matt, The Points Guy) circa 2014–2016 with "free tool for travelers" pitch. Got into roundup posts that still drive traffic.
- **Crohn's & Colitis Foundation partnership.** Flush listed CCF-verified accessible bathrooms; CCF promoted Flush to its email list (~150k members at the time).
- **Airline / travel inflight magazines** picked it up as a "useful travel app" — Southwest's *Spirit* magazine, Delta's *Sky*. They pitched the editors directly.

### 5. Yelp (early days, 2004–2007)
- **Yelp Elite program.** Free parties, swag, early access — turned the top 1% of reviewers into unpaid evangelists. Cost per Elite was ~$30/year in beer; output was thousands of reviews.
- **City-by-city launch with local "Community Managers"** — one full-time hire per metro who threw events, befriended bar owners, collected emails. SF first, then NYC, then Chicago.
- **Business-claim flow** drove organic SEO. Every business got a free page; owners would claim it (and link to it from their own site), which fed Yelp's backlink profile.
- **Local press: SF Weekly, SF Chronicle.** Founders comped reviewers to dinners, not bribes — just "come see this thing."

---

## Cross-cutting patterns

| Pattern | Apps that used it |
|---|---|
| Programmatic SEO with `/city` or `/near-me` pages | GasBuddy, AllTrails, Yelp, Flush |
| Single-geo dominance before expanding | Citymapper, Yelp |
| Health/accessibility nonprofit partnership | Flush, AllTrails (vets/disability hikes) |
| Local TV news during a relevant news cycle | GasBuddy |
| Travel blogger / inflight magazine seeding | Flush, AllTrails |
| Subreddit answer-seeding (not posting "check out my app") | Citymapper, Flush |
| App store keyword domination | Flush, GasBuddy |
| Free tier indefinitely; paywall only at scale | AllTrails, Yelp |

---

## Tactical playbook for Gotta Go (8 actions, ranked by effort × likelihood)

### A1. Reddit answer-seeding in 5 specific subs
- **Effort:** 2 hours/week, ongoing for 4 weeks
- **Impact:** 200–2000 visitors total (most posts will flop; one might hit)
- **How:**
  1. Subscribe to: r/AskNYC, r/AskSF, r/london, r/AskLosAngeles, r/travel, r/IBD, r/CrohnsDisease, r/UlcerativeColitis, r/festivals, r/runningformomenoftime (any "where can I pee" query magnet).
  2. Search each sub weekly for "bathroom", "toilet", "restroom", "where can I pee".
  3. Reply with a *useful* answer first (specific places), then "I built gottago.app for exactly this — no signup."
  4. Never post a top-level "check out my app" — those get nuked. Comments on existing questions survive.

### A2. Show HN + r/SideProject + r/InternetIsBeautiful launch trio
- **Effort:** 4 hours (one evening)
- **Impact:** 1k–10k visitors in 24h if it lands; nothing if it doesn't
- **How:**
  1. Title for HN: "Show HN: Gotta Go – nearest public restroom, no signup". Submit Tue/Wed 9am ET.
  2. r/SideProject same morning, different title: "I built a no-signup public bathroom finder after one too many emergencies".
  3. r/InternetIsBeautiful 24h later if HN does anything.
  4. Be in the comments for the first 4 hours answering everyone. Conversion to traffic depends entirely on your comment hustle.

### A3. Programmatic `/restrooms-near-<city>` pages
- **Effort:** 1–2 days
- **Impact:** Slow burn. Expect 0 traffic for 60 days, then 500–5000/mo if Google indexes
- **How:**
  1. Generate static pages for top 200 US/UK/CA cities + top 50 tourist cities (Paris, Tokyo, Bangkok…).
  2. Each page: H1 "Public Restrooms in <City>", a real map with seeded OSM data for that city, a list of 10–20 named locations, a "permalink" for each.
  3. Submit sitemap.xml to Google Search Console + Bing Webmaster Tools.
  4. Internal-link cross-city ("Visiting from Boston? See Boston restrooms"). This is the AllTrails playbook precisely.

### A4. Crohn's/IBD/UC nonprofit partnership pitch
- **Effort:** 4 hours to draft + send 5 emails
- **Impact:** If even one nonprofit links from a resource page, that's a permanent referral source + DA backlink
- **How:**
  1. Targets: Crohn's & Colitis Foundation (CCF), Crohn's & Colitis UK, IBD Support Foundation, Bladder & Bowel Community, Simon Foundation for Continence.
  2. Pitch: "Free, no-signup tool. No tracking. Would you list it on your resources page? Happy to add a 'Verified accessible' filter and let your community flag locations."
  3. Offer to add their logo to a "Trusted by" section on Gotta Go in exchange for a backlink.
  4. Realistic: 1 in 5 will reply, 1 in 10 will link. That's still good.

### A5. Local TV news pitch tied to a news cycle
- **Effort:** 6 hours (research + 30 emails)
- **Impact:** Wildly variable. One hit = 10k–100k visitors in a day
- **How:**
  1. Wait for a news hook: a city closing public restrooms, a viral "no bathroom in NYC" tweet, festival season, marathon weekend.
  2. Email local TV consumer reporters (find via station websites, e.g. ABC7 NY, KTVU SF). Subject: "Free tool that maps every public bathroom in <city> — built by one developer, no app download."
  3. Pitch is the human-interest angle: "Built it after my dad with Crohn's couldn't find one in midtown" (or whatever's true).
  4. Have a 30-second screen recording ready. Reporters will not figure your site out themselves.

### A6. Travel blogger + inflight magazine seeding
- **Effort:** 1 day to identify + email 30 outlets
- **Impact:** 1–3 placements over 90 days; each is worth ~500–5000 visitors and a permanent backlink
- **How:**
  1. Targets: Nomadic Matt, The Points Guy, Travel + Leisure "Best apps for travelers" annual roundup, Lonely Planet's blog, Afar.
  2. Inflight magazines: Hemispheres (United), American Way (American), Delta Sky.
  3. Pitch: "No-signup, works in 200 cities, no app to download — useful for your audience."
  4. Send to a real editor name (not info@), reference one of their recent posts, keep it under 100 words.

### A7. App store launch (PWA → wrapped iOS/Android)
- **Effort:** 3 days for both stores using Capacitor (already in package.json)
- **Impact:** App store SEO is huge for "toilet" and "bathroom" queries — Flush proved this
- **How:**
  1. Wrap the existing PWA via Capacitor (already configured).
  2. App name: "Gotta Go: Restroom & Toilet Finder" — keyword-stuffed but legal.
  3. Description: front-load "public restroom near me", "toilet finder", "bathroom map", "no signup", "free".
  4. Screenshots: real map screenshots > marketing copy. Flush's screenshots are literally just the app — that's why they rank.
  5. ASO budget: $0. Iterate keywords monthly.

### A8. Festival / marathon B2B partnerships
- **Effort:** 2 weeks of cold email
- **Impact:** Unpredictable. One festival deal could put Gotta Go on 50k attendees' phones
- **How:**
  1. Targets: Coachella, SXSW, Burning Man (Black Rock City has its own porta-potty map need), local marathons (NYC, London, Chicago, Boston).
  2. Pitch to event ops: "We'll build a custom map of your event's restrooms. Free. You link from your attendee FAQ."
  3. Side door: pitch the *attendee subreddits* with the festival map a week before the event.
  4. Same playbook works for music venues, county fairs, state parks.

---

## Phase plan

### Phase 1 — Days 0–7: launch posts + low-friction wins
- **Day 1–2: A2 (Show HN trio).** Pick a Tuesday or Wednesday. One shot. Reply to every comment for 4 hours.
- **Day 3–7: A1 (Reddit answer-seeding).** Find 10 existing questions across the listed subs and answer each. No top-level posts.

Rationale: A2 is a free lottery ticket. A1 is the only Reddit play that doesn't get instantly removed. Both cost zero dollars and one weekend.

### Phase 2 — Weeks 2–4: SEO content + niche communities
- **Week 2–3: A3 (programmatic city pages).** Ship 200 city pages. Submit sitemap. This is the highest-leverage technical work in the plan.
- **Week 3–4: A4 (nonprofit partnerships).** Send 5 personalized emails. Follow up once after 7 days. Stop after that — most won't reply.

Rationale: A3 starts the SEO clock (60-day minimum to ranking). A4 is high-value if even one lands; failure mode is just unopened emails.

### Phase 3 — Months 2–3: partnerships + influencer reach
- **Month 2: A6 (travel bloggers + inflight magazines).** 30 cold emails. Expect 1–3 hits.
- **Month 3: A5 (local TV news).** Wait for a news hook. Don't pitch cold — pitch reactively when restroom news breaks.

Rationale: By month 2 you have city pages, social proof from Phase 1, and ideally one nonprofit logo. That makes outbound far more credible.

### Phase 4 — Months 4–6: scale plays
- **Month 4–5: A7 (app store launch).** Wrap with Capacitor. iOS and Android. ASO is the long-term moat for "find a bathroom" queries.
- **Month 5–6: A8 (festival/event partnerships).** Pitch summer festivals and fall marathons. One landed deal puts the app in front of tens of thousands of people in a high-bathroom-stress context.

Rationale: A7 requires you to have proven product-market fit on web first (so you know what to ship). A8 is the highest-effort play and only worth doing if Phases 1–3 confirmed people use the thing.

---

## Honest expectations

- 6 of these 8 actions will produce roughly nothing measurable.
- The 2 that work will likely be A3 (programmatic SEO) and A1 (Reddit answer-seeding) — both because they compound and because the product genuinely answers a question people Google.
- A5 (local TV) is the high-variance bet — could be the biggest single hit or could go nowhere.
- Don't build a paywall until 10k+ MAU. Flush, AllTrails, and Yelp all waited.

---

## Scheduled runs

Run these as recurring agents in Claude Code. Paste each into `/schedule`.

### Marketing agent — weekly (Mondays 9am)
```
Cron: 0 9 * * 1
Prompt:
You are the marketing agent for Gotta Go (https://oscar-leung.github.io/restroom-finder/).
1. Search Reddit (r/AskNYC, r/AskSF, r/london, r/AskLosAngeles, r/travel, r/IBD, r/CrohnsDisease, r/UlcerativeColitis, r/festivals) for posts in the last 7 days mentioning "bathroom", "toilet", "restroom", or "where can I pee".
2. Return up to 10 candidates with: subreddit, post URL, post title, post age, my draft reply (helpful answer first, soft Gotta Go mention second).
3. Flag any that already have 50+ comments — those are too late.
4. Write the report to /Users/oscarleung/restroom-finder/logs/reddit-weekly-YYYY-MM-DD.md.
Do not post anything. Oscar reviews and posts manually.
```

### SEO agent — weekly (Wednesdays 9am)
```
Cron: 0 9 * * 3
Prompt:
You are the SEO agent for Gotta Go.
1. Pull Google Search Console data for the last 7 days (impressions, clicks, top queries, top pages).
2. Identify 5 queries where Gotta Go ranks 8–20 (one push away from page 1).
3. For each, recommend a specific page edit (title tag, H1, internal link, content addition).
4. Check that all 200 /restrooms-near-<city>/ pages are indexed; list any that are not.
5. Write findings to /Users/oscarleung/restroom-finder/logs/seo-weekly-YYYY-MM-DD.md.
```

### Analytics agent — daily (8am)
```
Cron: 0 8 * * *
Prompt:
You are the analytics agent for Gotta Go.
1. Read yesterday's Plausible/GA4 data: visitors, top sources, top pages, bounce rate, avg session.
2. Compare to 7-day rolling average. Flag any source with >2x its baseline (a hit) or any page with sudden drop.
3. Note any referrer that looks like press, an inflight magazine, or a nonprofit page — those are the tactics paying off.
4. Append a one-line summary to /Users/oscarleung/restroom-finder/logs/analytics-daily.md.
Skip if traffic <50 visitors (too noisy to interpret).
```

### A/B testing agent — biweekly (every other Friday 2pm)
```
Cron: 0 14 * * 5/2
Prompt:
You are the A/B testing agent for Gotta Go.
1. Review the last 2 weeks of analytics. Identify the single biggest conversion drop in the funnel (landing -> map loaded -> location used -> direction clicked).
2. Propose ONE A/B test for the next 2 weeks. Include: hypothesis, control, variant, success metric, minimum sample size.
3. If a test is currently running, instead: report results, declare winner if 95% confidence, otherwise extend or kill.
4. Write to /Users/oscarleung/restroom-finder/logs/abtest-YYYY-MM-DD.md.
Do not deploy code. Oscar implements.
```

### Press-cycle agent — weekly (Thursdays 10am)
```
Cron: 0 10 * * 4
Prompt:
You are the press monitoring agent for Gotta Go.
1. Search Google News and Twitter/X for the last 7 days: "public bathroom", "no public restrooms", "city closes bathrooms", "where to pee NYC", marathon news, festival news.
2. Identify any story Gotta Go could ride (consumer outrage, festival coming up, mayor closing toilets).
3. For each, draft a 100-word pitch email to a named local TV consumer reporter at the relevant station.
4. Write to /Users/oscarleung/restroom-finder/logs/press-weekly-YYYY-MM-DD.md.
Oscar sends manually.
```
