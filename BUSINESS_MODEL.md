# Business Model — Gotta Go

The product is free forever. Revenue comes from three legs, in order
of likelihood-to-actually-work for a solo project:

1. **Display ads** (passive, scales with traffic)
2. **Bounty marketplace** (data flywheel — we *spend* revenue here, then earn it back)
3. **Premium / B2B** (small, but high-margin)

---

## Leg 1 — Display ads

**Stack**: Google AdSense for web, AdMob for native (when Capacitor
builds ship). Both are free to set up and pay net-30.

**Realistic numbers** (no fudging):

| Sessions / month | Page views / session | RPM (US-heavy traffic) | Monthly revenue |
|---|---|---|---|
| 1,000 | 3 | $4 | ~$12 |
| 10,000 | 3 | $5 | ~$150 |
| 50,000 | 3 | $6 | ~$900 |
| 250,000 | 3 | $7 | ~$5,250 |
| 1,000,000 | 3 | $8 | ~$24,000 |

A "find a bathroom" app gets 1–4 page views per session — short
intent. RPMs run lower than content sites. The numbers above assume
no ad-blocker hits (real-world ad-blocker rate on a tech-savvy
audience is 25–40%).

**What we need from Oscar to turn it on:**
1. AdSense account ($0, but requires a real address + tax info)
2. Site approved by AdSense (takes 1–14 days; site needs to look
   legitimate — STATUS.md, README.md, ROADMAP.md, MARKETING_PHASES.md
   all help)
3. AdMob property linked to AdSense once native ships
4. Privacy Policy + Cookie Banner + GDPR compliance bits (the
   `privacy-policy.html` page is an outstanding TODO)

**Where ads go:**
- One sticky bottom unit on the main view (small, ignorable)
- One in-feed unit between alternative cards
- One full-width unit at the top of the details modal
- Never in the way of the GO button — that's the conversion event

---

## Leg 2 — Bounty marketplace (the "pay people to update bathrooms"
playbook)

**The vision**: pay verified users $1 to physically visit a bathroom
that's gone stale and confirm it's still there, still works, still
clean. This is how Gotta Go's data outpaces Toilet Finder — they're
crowdsourced for free and slowly rot; we pay for freshness.

**The economics (per bounty)**:
- Bounty cost: $1.00
- Stripe fee on payout: ~$0.05 (Connect Express)
- Platform handling: $0.05 (3% to cover Stripe fees / fraud reserve)
- AI verification cost: ~$0.02 (one Claude/GPT call to read the photo
  + GPS + comment and judge "looks legit")
- **Net cost to us**: ~$1.12 per verified data update

**Where the money comes from**:
- Ad revenue from above pays for bounties (closes the loop)
- Or: a handful of B2B customers (universities, malls, transit
  authorities) pay $200–$2,000/month to keep their venue's bathrooms
  fresh in the public dataset and to receive negative-review alerts
  before they show up on Yelp

**Trust + fraud guards**:
- One bounty per bathroom per 14 days max
- Each verifier capped at 5 bounties per day (~$5/day max per person)
- AI checks: photo EXIF GPS matches the bathroom's lat/lng within
  100m, photo isn't a stock image, comment isn't AI-generated boilerplate
- Manual review queue for the first 50 bounties per new verifier
- Suspicious accounts auto-flagged for human review

**What we need from Oscar to turn it on**:
1. Stripe Connect Express (free; takes a US business or sole
   proprietorship + tax info)
2. A backend (Cloudflare Workers + D1 is enough): one route to claim
   a bounty, one to submit verification, one webhook for AI scoring,
   one for Stripe payouts
3. AI verification provider (Claude API or GPT-4o-mini — both are
   pennies per call)
4. Terms of Service + Bounty Hunter Agreement (a lawyer, $200–$500
   one-time)

**Phased rollout**:
- Phase 0 (now): UI shows "$X bounty available" but is non-payable.
  We're collecting demand signal — how often users tap "I'd verify
  this" before money is real.
- Phase 1: $1 bounties, 100 verifiers, manual review of every payout
- Phase 2: Scale to 10k verifiers, AI review, automated payouts

---

## Leg 3 — Premium / B2B

**Premium for individuals — "Gotta Go Plus" — $2.99/mo or $19.99/yr**:
- Hide ads
- Offline mode (last 200 nearby cached)
- Unlimited photo uploads (free tier limited to 5/bathroom)
- Cross-device sync (favorites, reviews, streak, achievements)
- Apple Watch / Wear OS companion (when native ships)

Conversion target: 1.5% of MAU. At 50,000 MAU → ~750 subscribers →
~$2,250/mo. Small but high-margin.

**B2B — "Gotta Go for Venues"**:
- Universities, malls, transit authorities, large public-facing
  buildings
- Pay $200–$2,000/mo to:
  - Pin their bathrooms with verified-clean badges (paid-for stamping)
  - Get alerts when a bathroom gets <3-star reviews
  - Custom branding on detail page ("Sponsored by Westfield")
  - Aggregate analytics on usage patterns at their venue

This leg is real money but slow — sales cycle is 1–3 months per
account. Needs Oscar to send 5–10 outreach emails per week starting
in Phase 3 of MARKETING_PHASES.md.

---

## Total revenue stack at scale (12-month-out, optimistic-but-honest)

Assuming 50,000 MAU by month 12:

| Leg | Monthly revenue |
|---|---|
| Ads | $900 |
| Premium (1.5% conversion) | $2,250 |
| B2B (5 clients @ $500 avg) | $2,500 |
| Bounty marketplace (cost) | -$2,000 (not revenue, but pays for itself in ad lift from fresh data) |
| **Net** | **~$5,650/month** |

This is "side-project succeeding" money — meaningful but not
quit-your-job. To get to $20k+/month requires native iOS/Android
shipping (much higher LTV per user) or a viral hook (TikTok
moment). Neither is guaranteed.

---

## Where Claude can keep helping (autonomously) vs where Oscar must act

**Claude (autonomous, scheduled)**:
- Build features behind feature flags
- A/B test copy + UX changes
- Write launch posts, blog content, outreach emails (drafts only)
- Monitor analytics, surface anomalies
- Build the bounty system's code (UI, AI verification logic, fraud
  rules) — runs in CI

**Oscar (legally must)**:
- Sign up for AdSense / AdMob / Stripe Connect
- File business / tax docs as needed
- Approve Terms of Service + Privacy Policy (review with a lawyer)
- Submit to App Store / Play Store
- Pay (the lawyer, the dev accounts, the cloud bills)
- Send B2B outreach emails (or at least sign off on AI drafts)
