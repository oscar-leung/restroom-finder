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
