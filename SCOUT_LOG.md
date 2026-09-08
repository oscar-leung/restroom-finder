# Scout log

Append-only. Newest entry at the bottom. Each daily run reads this first so it
builds on prior findings instead of rediscovering them.

---

## 2026-09-03 — first run

**Health:** app, guides index, privacy, 3 sample guides, ads.txt, sitemap.xml all
HTTP 200 (~0.14s). restroom-finder deploys green.

**Fixed — qa-portfolio CI regression.** Scheduled runs had gone red again: the same
4 checkout tests timing out while all 13 single-page tests passed, with 8 reruns
stretching the job to 19m31s. `test_checkout.py` sorts first, so those
navigation-heavy tests were absorbing the whole cold-start cost of a fresh runner
(DNS, TLS, CDN) against a live third-party site. Added a session-scoped warm-up
fetch; cut `--reruns` 2→1; raised CI timeout 30s→45s.

**Fixed — AdSense required-pages gap (urgent, review pending).** Google's Feb 2026
AdSense update requires About + Privacy + **Terms** + **Contact**, all reachable
from every page. We had About and Privacy only. Added `terms.html` and
`contact.html` and put all four in every footer (20 guides, privacy, about).

**Scouting findings**

- *AdSense 2026 bar:* 15–25 posts of 800–1000+ words → we clear it (20 articles,
  ~1,800 words each). Decisions come in 1–14 days typically, up to 3 weeks.
- ⚠️ *Free-subdomain risk:* multiple 2026 approval guides report that free
  subdomains and low-grade hosting trigger rejections, and we are on
  `oscar-leung.github.io`. A custom domain (~$15/yr) is the single highest-value
  purchase for ad revenue. **Oscar's call.** If the review is rejected, this is
  the first thing to change before reapplying.
- *Competitors:* Flush (jRustonApps) alive and updated, ~200k listings — still the
  volume leader. No shutdowns found. No distribution vacuum right now.
- *Data sources:* Refuge Restrooms actively maintained (repo commits Jan 2026),
  public API, no key required, no deprecations found. Safe to keep depending on.
- *News hooks for content (not yet written):* Portland passed an all-user
  restroom-signage ordinance Feb 2026; NYC passed a "bathroom bill" directing a
  public restroom per ZIP code. Both are live news pegs and both mean
  `restroom-access-laws.html` is now out of date. **Top candidate for the next
  run's one improvement.**
- *Mentions:* no third-party mentions of Gotta Go found yet — expected pre-launch,
  since the Reddit posts have not gone out.

**Needs Oscar:** AdSense payments/tax profile · Google Play $25 · Apple $99 +
macOS 14.5/Xcode 16 · Reddit posts in THIS_WEEK_POSTS.md · decide on custom domain.

---

## 2026-09-03 — follow-up (requested by Oscar)

**Updated `restroom-access-laws.html` with municipal law.** Added a
"What Cities Are Doing: Portland and New York" section (1,942 → 2,549 words),
plus one FAQ, with the FAQPage JSON-LD kept in sync (6 visible = 6 schema).

Corrected an error from the first run's scouting notes: NYC's bathroom law
passed **April 10, 2025** (Intro 694-A, Nurse) — not 2026. The 2026 items are
two newer bills (ADA restrooms in public buildings; a capital funding plan)
that were introduced, not passed. Facts verified against the NYC Council press
release and Portland.gov, not the search snippets.

Key facts now in the guide: NYC targets ≥2,120 public bathrooms by 2035, half
publicly owned, against ~1,100 today for 8.6M residents (1 per 7,820); builds on
Local Law 114 of 2022 (one feasible location per ZIP). Portland's Feb 11, 2026
ordinance is signage-only — all-user signs on single-occupancy restrooms in
places of public accommodation, no construction, ~$5 per sign, extending a 2015
city-buildings resolution to the private sector.

Framing kept honest: NYC's is a planning/target law, not a right you can invoke;
Portland's changes labels, not supply. Neither is a substitute for Ally's Law.

---

## 2026-09-08 — run 3

**Health:** app, guides index, privacy, terms, contact, about, 3 sample guides,
sitemap.xml, robots.txt, root ads.txt — all HTTP 200. restroom-finder deploy
green. qa-portfolio CI green on the last 3 scheduled runs (2m27s, no reruns —
the Sept 3 warm-up fix is holding).

**AdSense — the account is NOT in review. It was never activated.** The console
banner reads *"To start earning from AdSense, you need to add your payment info
and connect your site"*, and `/sites` redirects to `/onboarding`. Under the
current AdSense flow, review does not begin until the account is activated, so
the previous two runs' "review pending" reading was wrong — nothing is pending.
This is blocked entirely on Oscar (payment/tax profile is a hard limit for me).

Two side findings from the same check:
- An ad blocker in Oscar's Chrome crashes the AdSense UI ("Something went wrong
  … your browser is using an ad blocker"). Only the notification banner renders.
  He should allowlist `adsense.google.com` before working in the console.
- The AdSense site is the whole `oscar-leung.github.io` host, whose **root page
  carries no AdSense snippet**. It used to: commit `e08b62f` (Sept 3,
  *"remove AdSense script from portfolio pages (C1)"*) deliberately stripped it
  during the recruiter-facing portfolio rework. That was the right call for a
  résumé site and I did **not** revert it — but it means the domain root Google
  verifies against is ad-free while the 24 Gotta Go pages carry the tag. Oscar
  has to pick one: put the snippet back on the portfolio root, or (better) buy a
  custom domain for Gotta Go so the two projects stop sharing a monetization
  identity. This is the second run in a row pointing at the custom domain.

**Search Console — the real ceiling.** 3 indexed pages, 0 clicks, 0 impressions
for the entire property. Both submitted sitemaps (`/sitemap.xml` and
`/restroom-finder/sitemap.xml`) show **"Couldn't fetch"**, last read Aug 30,
0 discovered pages. Verified against the live files: both return 200 with
`content-type: application/xml` and pass `xmllint`, and robots.txt allows all.
So the fetch failure is stale state on Google's side from a submission made
before the files existed, not a defect in the files. 22 of 25 pages have no
discovery path at all.

**Scouting findings (new this run)**

- ⚠️ *Name collision.* A different bathroom-finder called **"Gotta Go"** already
  exists at `gotta-go.github.io` (Gotta-Go/Gotta-Go.github.io on GitHub), plus a
  React Native "Gotta Go Bathroom Locator" and an App Store **"Got To Go: Free
  Bathroom Finder"** (id1297857219). Same name, same category, same hosting
  provider. This hurts brand search and could become a Play/App Store listing
  problem. Worth deciding on before store submission — renaming is cheap now and
  expensive after launch.
- *New competitor:* **Go Now Restroom Finder / GONow** (Strategic Risk
  Transfers, Inc.), iOS id6746770010 + Google Play `com.reddevinc.gonow`, a 2025–26
  launch pitching the exact same audience we do — IBS, road trips, parents,
  runners. First genuinely new entrant seen since run 1. No distribution vacuum;
  the space is getting more crowded, not less.
- *New SEO competitor:* `public-restrooms.org` is publishing dated roundups
  ("Best Apps to Find Public Restrooms Near You (2026)"), which competes head-on
  with our `best-restroom-finder-apps.html`.
- *Flush* still healthy (jRustonApps, ~200k listings, offline mode, filters for
  disabled access / key required / fee). No shutdowns.
- *Refuge Restrooms:* no outages, deprecations or API changes found. Safe.
- *AdSense policy watch:* policies last updated Aug 4, 2026. TCF v2.3 required
  for EEA/UK/Swiss consent strings from Mar 1, 2026 (not applicable until we run
  ads and get EU traffic). AI-content enforcement continues to target
  "low-quality AI content published in large amounts" — which is exactly why the
  one-item-per-run limit stays.
- *News peg:* Philadelphia's **"Philly Phlush"** Portland Loo program — first
  unit opened Fotterall Square June 2026, second at 15th & Arch, third coming to
  Clark Park; six units funded, all installed by 2027, open 8am–7pm. Philadelphia
  is not one of our 9 city guides and now has a live news hook.
- *Mentions:* still no third-party mentions of our Gotta Go. Expected — the
  Reddit posts have not gone out.

**Ranked keyword gaps** (demand × how well we can answer, best first)

1. **"Which stores let you use the bathroom without buying anything"** — the
   Starbucks Jan 27, 2025 purchase-required reversal made this a permanent,
   high-volume query, and the answer is a chain-by-chain table (Starbucks,
   McDonald's, Target, Walmart, Home Depot, libraries, hotels, gas stations)
   cross-referenced against the ~20 state Restroom Access Acts we already
   document. Nothing in our 20 guides covers it as a topic; Starbucks appears
   only in passing in 3 guides. Highest-value single article available to us.
2. **Public restrooms in Philadelphia** — live news peg (above), a major metro
   we don't cover, and it slots straight into the existing city-guide template.
3. **All-gender / gender-neutral restroom finding** — currently scattered across
   5 guides, no dedicated page, and it is Refuge Restrooms' core audience.
4. Accessible/ADA restroom finding — same situation: mentioned in 9 guides,
   owned by none.
5. Remaining metros: Austin, Denver, Portland, Miami, Atlanta, New Orleans.

**Changed this run — sitemap coverage (the Part 1 breakage).**

- `restroom-finder` `579220d` — added privacy.html, terms.html and contact.html
  to the sitemap (22 → 25 URLs). Those three were added last run for AdSense
  compliance and never made it into the sitemap.
- `oscar-leung.github.io` `815deb1` — `/sitemap.xml`, the URL in robots.txt and
  the one Google refetches on its own, listed only the two portfolio pages.
  Converted it into a **sitemap index** pointing at the portfolio's own
  `sitemap-portfolio.xml` and at `/restroom-finder/sitemap.xml`, and added the
  second `Sitemap:` line to robots.txt. All 25 Gotta Go pages are now reachable
  from the host's canonical sitemap, and future projects on this host inherit
  the same discovery path with no new submission.

Both deploys green; verified live (root sitemap index 200, sitemap-portfolio.xml
200, restroom-finder sitemap 25 `<loc>` entries, robots.txt lists both).

Deliberately **not** done: re-adding the AdSense snippet to the portfolio root
(Oscar removed it on purpose), and resubmitting the sitemaps in Search Console
(submitting forms on live services is outside what I do unattended).

**Needs Oscar:** resubmit both sitemaps in GSC · AdSense activation
(payment/tax profile) · decide portfolio-root snippet vs. custom domain ·
decide on the "Gotta Go" name collision · Google Play $25 · Apple $99 +
macOS 14.5/Xcode 16 · Reddit posts in THIS_WEEK_POSTS.md.
