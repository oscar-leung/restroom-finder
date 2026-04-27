# Making Money With Gotta Go

A realistic, phased plan — no "get rich quick" stuff. Each phase builds on
the previous one. You can skip phases, but you can't skip users: **nothing
below works without a real user base**, and that's the hardest part.

---

## The brutal math first

- App Store / Play Store installs alone don't make money. You need users
  who *open the app* regularly — "MAU" (monthly active users).
- A restroom finder is a **one-off / emergency** app. Low repeat usage.
  Most users open it 1–3× / week while traveling.
- Realistic revenue per active user per month (RPMAU):
  - Web banner ads (AdSense): $0.10 – $0.50
  - Mobile banner ads (AdMob): $0.30 – $1.00
  - Premium subscription (1% conversion at $2.99/mo): $0.03
  - **Combined: ~$0.50 – $1.50 per MAU per month**
- So to clear **$500/mo** you need **~500–1,000 MAU**.
- To clear **$5,000/mo** you need **~5,000–10,000 MAU**.

That's not impossible — but it means the first year is about **growth**,
not revenue. Treat monetization hooks as "on by default, minimal friction"
so revenue compounds as users arrive.

---

## Phase 1 — Ship & instrument (Weeks 1–2) · Revenue: $0

**Goal: turn the thing into a product people can find.**

- [x] Deployed to Vercel (PWA, installable on iOS + Android home screens)
- [ ] Add Google Analytics 4 or Plausible (free tier) — you **must** know
      how many people open it, from where, and what they click.
- [ ] Add Sentry (free tier) for error tracking.
- [ ] Publish on Product Hunt and r/sideproject.
- [ ] Reddit launch posts in `r/InternetIsBeautiful`, `r/travel`,
      `r/Crohns`, `r/IBS` (the last two are high-intent audiences who
      actually need this tool — treat them respectfully, not spammily).

**What to optimize:** time-to-first-restroom-shown. Under 3 seconds on a
4G phone = people will share it. Over 5 seconds = they bounce.

---

## Phase 2 — Passive revenue (Weeks 3–6) · Revenue: ~$0–$50/mo

**Buy Me A Coffee (zero setup, instant)**
- Add a small "☕ Tip the dev" link at the bottom of the app.
- Earnings: modest (~$5–$30/mo at low traffic), but validates that
  people care enough to give money.
- Sign up: https://buymeacoffee.com — 5 minutes. No tax paperwork until
  you cross a threshold.

**Google AdSense banner**
- Add a single banner ad at the bottom of the scroll area (NOT in the
  hero card — never interrupt the core flow).
- Apply for AdSense after you have ~100 daily users (they reject empty
  sites). Approval takes 1–2 weeks.
- Expected earnings at 1000 monthly views: $1–$5/mo. Yes, really.
- The value isn't the money, it's the *mechanism* — plumbing that
  scales up with users.

**Affiliate links in details panel**
- When someone views a restroom at a coffee chain (Starbucks, Peet's),
  show "Buy something to thank them →" → Uber Eats / DoorDash affiliate
  link.
- ~5% commission on orders, so revenue is traffic × 5% × 2% conversion ×
  avg order ≈ real money at scale.
- Skip until you have 1,000+ MAU — not worth the integration effort
  earlier.

---

## Phase 3 — Ship native apps (Weeks 6–10) · Revenue: $50–$500/mo

**Why native apps matter for revenue:**
1. Home-screen icon = 10× higher return usage vs. a website.
2. AdMob pays 3–5× more per impression than AdSense.
3. You unlock push notifications → **re-engagement**, which is the #1
   lever for RPMAU.
4. App stores are an *actual discovery channel*. ASO (App Store
   Optimization) for keywords like "bathroom finder", "public restroom",
   "gender neutral bathroom", "accessible toilet" can pull users for
   free.

**Plan (see APP_STORE_ROADMAP.md for full steps):**
- Wrap in Capacitor (already scaffolded in this repo)
- Replace AdSense banner with AdMob
- Apple Developer: $99/year, Google Play: $25 one-time
- Submit to both stores → 1–2 weeks review

---

## Phase 4 — Premium tier (Weeks 10+) · Revenue: $200–$2000/mo

**"Gotta Go Pro" — $2.99/mo or $19.99/year**

Features worth paying for:
- **No ads** (the main one — people will pay to remove ads)
- **Offline mode**: cache nearest 50 restrooms so you can find one when
  your signal drops (real-world value — airports, subways, hiking)
- **Favorites / history**: remember the ones you liked
- **Smart notifications**: "You're near a well-rated restroom — save
  it for later"
- **Route-aware search**: paste a trip itinerary, get restrooms along
  the route

**Conversion math:** 1% of free users → paid is realistic. 5% is great.
At 5,000 MAU × 2% × $2.99/mo = **$299/mo recurring**.

**Tooling:** RevenueCat (free up to $10k/mo earnings) handles Apple/
Google receipts, subscriptions, free trials — so you don't write any
billing code. https://www.revenuecat.com

---

## Phase 5 — B2B & sponsored pins (Month 6+) · Revenue: $500–$10,000/mo

This is where side-projects sometimes quietly become real businesses.

**Sponsored pins**
- Local coffee shops, gas stations, malls pay $10–$50/mo to feature
  their location. "Sponsored · Peet's Coffee · Free Wi-Fi too".
- Sales cycle is long but LTV is huge. Start with 5 manual deals,
  then build a self-serve portal.

**White-label / B2B**
- Cities, festivals, stadiums, conferences all need "where's the
  restroom" tools. License the app with their branding.
- Typical deal: $500–$5,000 one-time setup + $50–$200/mo hosting.
- Outreach: event organizers, tourism boards, accessibility
  consultancies.

**Data licensing**
- Aggregate anonymous usage data (which neighborhoods have the worst
  restroom coverage) → sell to city planners, real estate analysts.
- Only viable at meaningful scale (50k+ MAU).

---

## What to NOT do

- **Don't charge up front.** $0.99 on the App Store kills all growth.
  Free + ads + premium always wins for utility apps.
- **Don't put ads in the hero flow.** Breaking the "I need to go NOW"
  moment destroys word of mouth.
- **Don't build features you haven't validated.** Every feature above
  should be a hypothesis. Ship small, watch analytics, double down on
  what users actually do.
- **Don't compete with Refuge Restrooms on data.** They have 30k+
  crowdsourced entries; use their API (we already do). Compete on
  *speed, UX, and emergency-mode design.*

---

## Your next 3 concrete actions

1. **Deploy to Vercel** (10 min) — see README. Make it live.
2. **Buy Me A Coffee account + link in the footer** (15 min) — first
   passive revenue stream with zero paperwork.
3. **Post to r/InternetIsBeautiful + Product Hunt** (1 hour) — this is
   the only way anyone finds out it exists.

Everything else follows from users. Ship first, monetize second.
