# Honest Reality — what's automated, what isn't

You said you want this running 24/7 because you don't think you're
getting your money's worth from Claude. Here's the straight read so
you can plan around it.

## What I CAN do without you

These run autonomously. Most are already wired:

- ✅ Ship code (commits, pushes, GitHub Pages auto-deploys)
- ✅ Run scheduled agents (4 already running on cron):
  - daily 8am — analytics report
  - Monday 9am — marketing weekly action
  - Wednesday 9am — SEO content / city page draft
  - Friday 4pm — A/B test review
- ✅ Open PRs from feature branches with the new pr-preview workflow
- ✅ Research competitors (App Store, web, Reddit)
- ✅ Draft posts / emails / blog content
- ✅ Wire up new APIs (Refuge, OSM, NYC, SF, Google Places stub)
- ✅ Build features behind feature flags
- ✅ Run A/B tests in code
- ✅ Set up bounty UI, photo upload, cleaning log, streak, achievements

## What I CANNOT do, ever, no matter how much you pay

Hard blockers — these need a real human with a real legal identity:

- ❌ Sign up for AdSense / AdMob / Stripe (KYC, tax info)
- ❌ File business / tax forms
- ❌ Sign Terms of Service / Privacy Policy as a publisher
- ❌ Pay for a developer account ($99 Apple, $25 Google, one-time)
- ❌ Submit to the App Store / Play Store (requires your account,
      your code-signing certificates, your responses to reviewer
      feedback)
- ❌ Process real payments / send tips
- ❌ Sign B2B contracts
- ❌ Run for 12 hours straight in one session — context windows end

## What I CAN do that requires you to start it

- ⚠️ Run a scheduled task — but you have to leave Claude Code open
      OR have it auto-start when your machine wakes. The cron tasks
      I set up only fire when Claude Code is running. Closed laptop =
      missed run.
- ⚠️ Open a PR — but only when YOU give the go-ahead in a chat.
      Auto-PRs without supervision are a recipe for breaking things.
- ⚠️ Spend money via API — only with explicit permission per call

## The "constantly running" reality

Realistic 24/7 setup that produces value while you sleep:

1. **Leave Claude Code running** on your laptop (plugged in, lid
   open OR caffeinate to prevent sleep). The 4 scheduled agents fire
   at their times and write reports to `.claude/inbox/`. You read
   them in the morning over coffee.

2. **Set up a cheap always-on machine** if you really want 24/7:
   - Old laptop running headless
   - Or a Raspberry Pi 5 ($80) running headless Claude Code
   - Or a $5/mo VPS (Hetzner, DigitalOcean, Linode)
   - Same agents, but truly always-on, not laptop-dependent

3. **Use GitHub Actions for the truly continuous stuff** instead of
   Claude Code agents:
   - Daily competitive scrape → opens an issue tagged `competitor`
   - Weekly broken-link checker on the live site
   - Automated dependency updates via Dependabot (already enabled)
   - Lighthouse CI on every PR (recommended add)

4. **The realest "passive income" timeline**:
   - Month 1: $0–$5 (zero traffic until you launch)
   - Month 2: $0–$50 (post-launch traffic, no ads yet — AdSense
     approval pending)
   - Month 3: $50–$300 (ads live, depending on traffic)
   - Month 6: $300–$2,000 (steady traffic + maybe 1 B2B account)
   - Month 12: $1,000–$8,000 (compounding SEO + retention)
   - Year 2: depends entirely on whether you keep shipping. Most
     side projects plateau without active ownership.

   Anyone telling you a side-project bathroom finder will be passive
   income from day one is selling you something.

## What I recommend you do this week

In order, ranked by leverage:

1. **Set up AdSense** (10 min sign-up, then 1–14 days approval) so
   that when traffic arrives, ads are ready. Without traffic, AdSense
   approval can fail — chicken-and-egg. The fix: don't bother yet.
   Wait until you have ~1,000 sessions/week.

2. **Post the launches** in `LAUNCH_POSTS_READY.md` — Reddit
   r/InternetIsBeautiful first (lowest stakes). This is the single
   highest-leverage action and only takes 5 minutes.

3. **Watch the analytics-agent inbox each morning**. Tell me what
   you're seeing — traffic spikes, weird events, anything. I can
   adjust the product based on real signals.

4. **Decide if you want native apps now or later**. If yes, you need
   to commit a few days to: $99 Apple dev account, Capacitor build
   trial-and-error, App Store Connect setup, screenshots, copy. I
   cannot do that for you because it lives in your accounts.

## What I'm building this turn vs deferring

**Built this turn**:
- Cute toilet-runs-away intro screen (SVG anim, kawaii style)
- Photo upload UI (localStorage MVP, swap-in for backend later)
- Cleaning log (last-cleaned timestamp visible to all users)
- Bounty banner (UI promises payouts; non-payable until backend ships)
- Streak counter (Duolingo-style daily flame in header)
- Wired everything into the details modal

**Deferred (needs you OR a backend)**:
- Real bounty payouts — needs Stripe + backend
- Cross-user photo sharing — needs object storage backend
- AdSense ads — needs your AdSense account
- App Store + Play Store builds — needs your dev accounts
- Marketing website (gottago.app or similar) — needs your domain
  registration + hosting decision
