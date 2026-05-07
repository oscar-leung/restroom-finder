# Launch Checklist — the one file you need

You said "what do you need from me?" Here's the honest, ordered list.
Each step lists: what YOU do, what costs, what I do once you've done it,
and how long it takes.

If you only do steps 1–3 you have a marketed PWA earning ad revenue.
Steps 4–6 unlock native iOS + Android.

---

## STEP 1 — Post the Reddit launch (today, free, 15 min)

**You do:** Open `THIS_WEEK_POSTS.md`. Copy-paste the **r/SideProject**
post first (the "Day 1 must-do"). Submit it. Stay in the comment thread
for 60 minutes replying to people. Then do r/InternetIsBeautiful.

**Cost:** $0
**Time:** 15 min posting + 60 min in the thread
**What I do after:** The analytics-agent fires daily 8am — I'll see traffic
spike in `.claude/inbox/` and tell you what to optimize next.

**Why first:** Without traffic, AdSense won't approve you (chicken-and-egg).
This is the unblock for everything else.

---

## STEP 2 — Apply for Google AdSense (today, free, 5 min)

**You do:**
1. Go to https://adsense.google.com → Sign up
2. Add site: `oscar-leung.github.io`
3. Fill in tax info (US: W-9; non-US: W-8)
4. Wait. Approval takes 1–14 days. Google needs to crawl the site and see real traffic — Step 1 above is the prerequisite.

**Cost:** $0 (revenue share — they take ~32%, you keep the rest)
**Time:** 5 min sign-up; 1–14 days approval
**What I do after:** When you get approved, you get a `ca-pub-XXXXXXXXXXXXXXXX` ID. You give it to me, I run `gh secret set VITE_ADSENSE_CLIENT --repo oscar-leung/restroom-finder` and trigger a redeploy. **Ads go live within 60 seconds.** All the code is already wired (`src/services/adsense.js`, `src/components/AdUnit.jsx`).

---

## STEP 3 — Set up a custom domain (this week, $15/yr, 30 min)

**You do:**
1. Buy `gottago.app` or similar at https://cloudflare.com/products/registrar (Cloudflare sells at cost — about $15/yr)
2. In GitHub repo Settings → Pages → Custom domain: enter your domain
3. In Cloudflare DNS: add a CNAME record pointing to `oscar-leung.github.io`
4. Wait ~1 hour for DNS propagation
5. Tick "Enforce HTTPS" in GitHub Pages settings

**Cost:** $15/yr (one-time-ish)
**Time:** 30 min, mostly waiting for DNS
**What I do after:** Update meta tags, OG cards, schema.org JSON, and the `homepage` URL in everything to point to the new domain. Improves SEO and link previews on social.

---

## STEP 4 — Apple Developer account (this month, $99/yr, 1–3 days)

**You do:**
1. https://developer.apple.com/programs/enroll/
2. Sign in with your Apple ID
3. Sole proprietorship is fine; D-U-N-S not required for individuals
4. $99 USD; renews annually
5. Wait 24–72 hours for Apple to approve (they verify identity)

**Cost:** $99/yr
**Time:** 30 min sign-up; 1–3 days approval
**What I do after:**
- Run `npx cap add ios` (Capacitor is already installed)
- Open Xcode, configure signing with your team ID
- Generate the iOS app icon set + splash screens (we already have the SVG icons)
- Build, test in iOS simulator, then on a real device
- Write the App Store listing copy + screenshots (5 required, I'll generate them)
- Submit through App Store Connect — **you have to click "Submit" yourself** because of code-signing rules
- Apple review takes 24–72 hours typically; rejections are common on first submission, I handle the back-and-forth

**Realistic timeline from your $99 to live in the App Store: 7–14 days.**

---

## STEP 5 — Google Play Developer account (this month, $25 one-time, 1–2 days)

**You do:**
1. https://play.google.com/console/signup
2. $25 one-time (yes, lifetime)
3. Identity verification — government ID + selfie now required (since 2024)
4. Wait 1–2 days for approval

**Cost:** $25 (one-time, never again)
**Time:** 30 min sign-up; 1–2 days approval
**What I do after:**
- Run `npx cap add android`
- Generate signed APK + AAB bundle
- App Bundle uploaded to Play Console (you click "Submit" — same code-signing reason)
- Write the Play Store listing
- Play review is typically 4–48 hours; first approvals can take 7 days for new accounts

**Realistic timeline from your $25 to live in Play Store: 5–10 days.**

---

## STEP 6 — Google AdMob (after native ships, free, 5 min)

**You do:**
1. https://apps.admob.com → Sign in (uses your AdSense account)
2. "Add app" → link your iOS app + Android app
3. Apple's IDFA / Android's AAID consent flows — I'll handle in code

**Cost:** $0 (Google takes ~32%)
**Time:** 5 min
**What I do after:** Wire `@capacitor-community/admob` into the native shells, place 1 banner unit at the bottom of the bathroom list, 1 interstitial after every 5 GO clicks. Ships in the next native build.

---

## Total cost to get to "shipped on App Store + Play Store + earning ad revenue"

| Item | Cost | One-time / recurring |
|---|---|---|
| Reddit launch | $0 | one-time |
| AdSense | $0 | recurring revenue share |
| Domain (gottago.app) | $15 | yearly |
| Apple Developer | $99 | yearly |
| Google Play | $25 | one-time |
| AdMob | $0 | recurring revenue share |
| **Total Year 1** | **$139** | |
| **Total Year 2+** | **$114/yr** | |

That's it. $139 to a real launched app on both stores with monetization.

---

## Realistic earning timeline (the honest version)

| Month | Sessions / mo | Ad RPM | Ad revenue | Notes |
|------|----------------|--------|------------|-------|
| 1 | <1k | n/a | $0 | Pre-AdSense approval, building traffic |
| 2 | 1–3k | $4–6 | $5–18/mo | AdSense approved mid-month |
| 3 | 3–8k | $5–7 | $20–55/mo | Native apps live, install bump |
| 6 | 10–30k | $6–9 | $80–270/mo | If SEO + retention compound |
| 12 | 30–100k | $7–10 | $250–1,000/mo | One viral moment + steady SEO |

Anyone selling you "passive income from a free side project" without
this curve is selling you something. This is the realistic shape.

---

## What I will not do without you

These are the hard blockers — they require a real human's legal identity:
- Sign up for AdSense / AdMob / Stripe
- File tax forms
- Pay for dev accounts
- Submit apps to the stores (code-signing requires your account)
- Sign Terms of Service / Privacy Policy as the publisher
- Create Apple ID / Google account

I CAN do everything else: code, drafts, screenshots, copy, store listings,
review responses, marketing posts, scheduled agents.

---

## Right now, do this in this order

1. **Read the Step 1 r/SideProject post in `THIS_WEEK_POSTS.md`** — already drafted, ready to copy
2. **Submit it** — 5 min
3. **Reply to comments for 60 min** — this is the actual work
4. **Tonight or tomorrow:** apply for AdSense (Step 2)
5. **This week:** buy the domain (Step 3)
6. **This month:** dev accounts (Steps 4 + 5)

Tell me when each step is done and I'll move on the next one immediately.
