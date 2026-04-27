# Gotta Go — Status & Next Steps

**Live**: https://oscar-leung.github.io/restroom-finder/
**Repo**: https://github.com/oscar-leung/restroom-finder
**Tip jar**: https://buymeacoffee.com/holymushy

---

## What this is

A "I need a bathroom NOW" app. Opens straight to the closest public
bathroom, one big GO button deep-links to Apple/Google Maps walking
directions. Map is secondary. No accounts required.

**Stack**: React 18 + Vite + Leaflet + react-leaflet
**Data**: Refuge Restrooms API + OpenStreetMap (Overpass) merged + deduped
**Hosting**: GitHub Pages, auto-deploys on push to `main`
**Mobile**: PWA (installable on iOS Safari + Android Chrome). Capacitor
scaffolded for native apps when you're ready.

---

## What's shipped

### UX
- [x] Hero card with closest bathroom front-and-center
- [x] Big GO button with one-tap directions
- [x] Swipe-to-next (left = closer, right = previous), keyboard arrows
- [x] Position dots + animated "swipe →" hint at index 0
- [x] Hero label updates: "CLOSEST" → "#2 NEAREST" → "#3 NEAREST"…
- [x] Alternative cards row (horizontal scroll)
- [x] Distance + walking time
- [x] Walk time formula (~80 m/min average)
- [x] "X nearby · Y within 500m · Z within 1km" count summary
- [x] Recently-added feed (your contributions)
- [x] Aurora gradient background (3 drifting blobs, GPU animations)
- [x] Mobile-first design with iOS safe-area insets
- [x] Fullscreen map overlay with custom SVG pins

### Data + features
- [x] Refuge Restrooms API integration
- [x] OpenStreetMap Overpass API integration
- [x] **NYC Public Restrooms open-data integration** (geofenced)
- [x] **SF Pit Stops open-data integration** (geofenced)
- [x] Smart dedupe (priority: user > city > Refuge > OSM, with metadata merge)
- [x] Accessibility + gender-neutral filters
- [x] **💰 Free filter** (hide entries that charge a fee)
- [x] **🕐 Open-now filter** (parsed from opening_hours)
- [x] Add-a-bathroom flow (your GPS + optional share to Refuge)
- [x] Reviews — 1-5 stars overall + cleanliness, with comments
- [x] **Review stars on hero + alt cards** (⭐ 4.2 (3))
- [x] **Better business names** (operator/brand fallback when OSM name is generic)
- [x] **Opening hours display** in details modal
- [x] **Open-now / closed-now badge** on hero + cards
- [x] Usage pattern tracker ("you usually go around 2pm")
- [x] Per-bathroom visit tracker
- [x] Personal concentration map (pins sized by your visits, count badge on 3+)
- [x] Map legend (public / added by you / your usuals)
- [x] User-added bathrooms colored amber with left border accent
- [x] A/B testing framework (`go_button_label` GO vs GO NOW running now)

### Deploy + infra
- [x] GitHub Pages CI/CD (`.github/workflows/deploy.yml`)
- [x] Vite base path configurable for Vercel/Netlify migration
- [x] PWA manifest + Apple/Android meta tags
- [x] Tip jar (Buy Me a Coffee, holymushy)
- [x] Capacitor installed (`npx cap add ios`, `npx cap add android` ready)
- [x] GA4 integration code (gated on `VITE_GA_ID` env var)
- [x] Event tracking: `go_clicked`, `alternative_promoted`, `map_opened`,
      `tip_clicked`, `bathroom_visited`, `hero_swiped`, `add_bathroom_opened`

### Documentation
- [x] `MONETIZATION.md` — phased revenue plan
- [x] `APP_STORE_ROADMAP.md` — Capacitor → iOS/Play Store path
- [x] `COLLEGE_MARKETING.md` — campus targeting strategy
- [x] `SEO.md` — keywords + city pages plan
- [x] `LAUNCH_POSTS.md` — first-cut platform drafts
- [x] `LAUNCH_POSTS_READY.md` — final polished posts (PH, IIB, Crohns, IBS)

### Agent fleet (in `.claude/agents/`)
- [x] `marketing-agent` — growth, launch posts, outreach
- [x] `frontend-agent` — UI, mobile, accessibility, perf
- [x] `seo-agent` — keywords, city pages, schema.org
- [x] `analytics-agent` — GA4 events, funnels, cohorts
- [x] `ab-testing-agent` — disciplined experiments
- [x] `software-engineer-agent` — data, deploy, Capacitor

Invoke them in any future session by mentioning their name or task
keywords (e.g. "have the marketing-agent write a TikTok script").

---

## What needs YOU (cannot be automated)

### 1. Google Analytics 4 setup (~10 min)
**Why you**: requires your Google account login.
**Do**:
1. https://analytics.google.com/ → create property "Gotta Go"
2. Add a Web data stream pointing to `https://oscar-leung.github.io/restroom-finder/`
3. Copy the Measurement ID (`G-XXXXXXXXXX`)
4. Add as repo secret at https://github.com/oscar-leung/restroom-finder/settings/secrets/actions
   - Name: `VITE_GA_ID`, Value: your `G-XXXXXXXXXX`
5. Trigger redeploy (Actions tab → Deploy to GitHub Pages → Run workflow)

After step 5, all the `trackEvent` calls already wired in the code start
sending data. Realtime view will show you within ~30s of opening the
site.

### 2. Post the launches (~15 min each)
**Why you**: requires your PH / Reddit accounts.
**Do**: open `LAUNCH_POSTS_READY.md` in the repo, copy each post's title
+ body, paste into the corresponding submit page:
- PH: https://www.producthunt.com/posts/new (schedule for Tuesday 12:01am PT)
- r/IIB: https://www.reddit.com/r/InternetIsBeautiful/submit (Sun eve)
- r/Crohns: https://www.reddit.com/r/CrohnsDisease/submit (Tue morning)
- r/IBS: https://www.reddit.com/r/ibs/submit (Mon midday)

The launch-day rhythm + 24-hour success bars are at the top of
`LAUNCH_POSTS_READY.md`.

### 3. Rotate leaked GitHub token
**Why you**: requires your GitHub login.
**Do**: https://github.com/settings/tokens → delete the
`ghp_lsXCh27...` token from earlier in our session. `gh` is now stored
in your macOS keychain so you don't need that token anymore.

### 4. Verify payment flow end-to-end
**Why you**: I'm not allowed to send real money.
**Do**: have a friend (or a $1 self-tip from another card) hit
buymeacoffee.com/holymushy after a real transaction completes,
confirm the supporter shows in your BMC dashboard. This is more about
verifying your bank payout setup than the link itself.

### 5. Native iOS/Android (when you're ready)
**Why you**: needs Apple Developer ($99/yr) + Google Play ($25 one-time)
accounts in your name, plus signing certificates.
**Do**: see `APP_STORE_ROADMAP.md` — Capacitor is already installed,
the actual `cap add` + `cap build` flow is doable in an afternoon
once you have the accounts.

---

## What could be done autonomously next (your call)

### Quick wins (under an hour each, fully automatable)
- **Country/region filter** — Legal Walls has this; would help global users
- **TikTok scripts + Twitter thread** — `marketing-agent` can write these
- **Programmatic city landing pages** — `seo-agent` can draft `/sf`, `/berkeley`,
  `/nyc` pages with local restroom counts (good for SEO + sharing)
- **PWA install prompt** — nudge users to "Add to Home Screen" after their 2nd visit

### Medium (a few hours)
- **Backend for cross-user concentration heatmap** — currently the
  visit-count "your usuals" feature is per-device. Real cross-user
  popularity needs a tiny serverless endpoint (Cloudflare Workers free
  tier is plenty).
- **Cross-device review sync** — same backend would unlock this.
- **Photo uploads on add-bathroom** — needs an image host (Cloudinary
  free tier or Supabase storage).

### Bigger (1+ days)
- **Native iOS/Android shells** — Capacitor wraps already done; needs
  signing certs + store submissions.
- **In-app reporting / moderation** — flag a bad entry, dispute a
  closed location.

---

## Honest current limitations (worth being upfront about)

- Reviews are device-local; clearing browser data wipes them.
- "Your usuals" / visit count is your own device only — no cross-user
  popularity yet.
- OSM coverage outside the US is patchy (especially in Asia + Africa).
- Geolocation has a 5s soft timeout — if it doesn't resolve, the app
  falls back to San Francisco with a banner.
- No account system (intentionally). Future: optional account with a
  password-less email link unlocks sync features.

---

## Repo command quick-ref

```bash
cd ~/restroom-finder
npm run dev          # local dev (port 5173)
npm run build        # production build → ./dist
git push             # auto-deploys via GitHub Pages workflow

gh run list --repo oscar-leung/restroom-finder --limit 5  # deploy history
gh run watch --repo oscar-leung/restroom-finder           # follow live
```
