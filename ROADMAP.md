# Gotta Go — Product Roadmap

Distilled from competitive research on Toilet Finder (4.5★, 328 reviews,
450,000 toilets globally) plus our own UX principles. Each item is sized
honestly and slotted into a priority lane.

---

## P0 — Required for parity with the leading app

These are things the leading "Toilet Finder" already does. We're behind
on these and they hurt perceived quality at first launch.

| # | Feature | Effort | Notes |
|---|---|---|---|
| 1 | **More data sources** to approach 450k+ entries | M | OSM (have) + Refuge (have) + add: city open-data (NYC, SF, LA), Wikidata `Q35525` toilets |
| 2 | **Photos on bathroom entries** | M | User uploads → Cloudinary free tier (25 GB). Show in details modal. |
| 3 | **Free / paid filter** | S | Toilet Finder users praise this. Many entries have a price field already. |
| 4 | **Opening hours display + "open now" filter** | S | OSM `opening_hours` tag is rich; parse with `opening_hours.js`. |
| 5 | **Star rating per bathroom** | S | We have reviews; add 1-5 stars + average display. |
| 6 | **Turn-by-turn directions in-app** | M | Currently we deep-link to Maps. Could embed Mapbox Directions or Leaflet Routing Machine for in-app routing. |
| 7 | **Better business names, not addresses** | S | Top complaint: "name = address". Promote OSM `name` tag → fallback to `amenity:type` → only then street. |

## P1 — Differentiators we already have or are nearly there

These set us apart. Polish, don't rebuild.

| # | Feature | Status |
|---|---|---|
| 8 | **One-tap GO** — closest answer first, not a list | ✓ shipped |
| 9 | **Swipe to next** — cycle nearest options | ✓ shipped |
| 10 | **Personal "your usuals" heatmap** — sized pins | ✓ shipped |
| 11 | **Usage pattern hint** — "you usually go around 2pm" | ✓ shipped |
| 12 | **Add a bathroom from current GPS** | ✓ shipped (top user request from competitor: "add via coordinates without being there" — we already do this) |
| 13 | **PWA install** — home-screen launch | ✓ shipped |
| 14 | **Aurora background + brand polish** | ✓ shipped |

## P2 — Should-haves before mass marketing

| # | Feature | Effort | Why |
|---|---|---|---|
| 15 | **Country / city filter** | S | Toilet Finder doesn't have this; helps travelers planning ahead. |
| 16 | **Offline mode** — last 50 nearest cached | M | "When my signal drops in the subway" is a real pain point. PWA Service Worker. |
| 17 | **Cross-device review sync** | L | Needs a backend. Cloudflare Workers + KV is enough at this scale. |
| 18 | **Cross-user concentration heatmap** | L | Same backend. Bathroom popularity = which spots to prioritize. |
| 19 | **Multilingual** — at minimum es / fr / de / ja | M | One JSON per locale + `lang` switcher. |
| 20 | **Report an issue** — flag closed / wrong location | S | Stores reports locally; surfaces a warning badge after N reports. |
| 21 | **Walking directions polyline** on the map | S | Visual "blue line" from you to the bathroom — instantly clearer than "200m away". |

## P3 — Nice-to-haves for retention

| # | Feature | Effort | Notes |
|---|---|---|---|
| 22 | **Push notifications** — "you usually go around 2pm, here's one nearby" | M | iOS PWA push works in Safari 16.4+; Android has had it for years. |
| 23 | **Apple Wallet / Google Wallet pass** | M | Speculative but viral — "save my favorite bathroom to Wallet". |
| 24 | **Streaks / gamification on contributions** | S | "5 bathrooms added this month" badge. Don't overdo it. |
| 25 | **Voice-activated GO** — for accessibility | S | Web Speech API. |
| 26 | **Apple Watch / Wear OS companion** | L | Big-ass Apple Watch crown → fast nearby lookup. |

---

## Verbatim user feedback to honor (from Toilet Finder reviews)

> "Allow suggestions for location names — business names would be more
> helpful than addresses." → **Item #7**

> "Enable adding places via GPS coordinates without being physically
> present." → **We already do this; just need to tell users.**

> "Include turn-by-turn navigation instructions to toilet locations." →
> **Item #6**

> "Map display issues in some versions." → **Watch our perf numbers.**

> "Easy to use", "life saver", "even in the middle of the desert" →
> **Don't break what works. Closest-first UX is the moat.**

---

## Decision principles

1. **Speed over surface area.** Adding more sources matters less than
   making the closest answer come faster. Don't ship a feature that
   adds latency to GO.
2. **One real source of truth.** When sources disagree, prefer
   user-contributed > Refuge > OSM > city open-data. Document why.
3. **Don't add accounts unless we must.** Add only when sync features
   genuinely require it. Even then, start with passwordless email.
4. **Honesty in copy.** If reviews are device-local, say so in the UI.
   Hidden limitations destroy trust faster than visible ones.
5. **A/B before big shifts.** Any UX change that touches the GO button
   ships behind a feature flag (see `src/utils/featureFlags.js`) and
   gets compared in GA4 before rolling out 100%.

---

## What ships next (in order)

1. P0 items 7 (better names), 4 (opening hours), 3 (free filter)
2. P0 item 5 (star ratings on reviews)
3. P0 item 2 (photo uploads — gates on a backend, slot it after P2 #17)
4. P2 item 21 (walking polyline on map)
5. P2 item 15 (country filter)
6. Backend (Cloudflare Workers) — unlocks #17, #18, #2

Estimated to ship #1–#5: a focused weekend.

---

## P0/P1 additions from user feedback (April 2026)

These are major directional asks captured here so they don't get lost.

### Account system (currently guest-by-default)
- Stay logged in as guest forever. Account creation optional.
- Account unlocks: cross-device sync (favorites, reviews, streak,
  achievements, photos, contributions)
- Auth: passwordless email link first; OAuth (Google/Apple) phase 2
- Backend required (Cloudflare Workers + D1 + KV is enough for MVP)
- Effort: **L** — at least a week of focused backend work

### Notifications (PWA + native push)
- "Bathroom near you was just reported clean"
- "A bathroom you contributed got 5 reviews"
- "There's a $1 bounty 200m from your route"
- iOS PWA push works in Safari 16.4+; Android always has
- Requires VAPID keys + backend + push permission flow
- Effort: **M-L** — a couple of focused days once backend exists

### Passive geo data collection
**Caveat first:** background geolocation is a battery / privacy
landmine. We will NOT do it without explicit opt-in, clear copy
about what's collected, and the ability to turn off in one tap.
- When the user opts in, sample location every 5 min while the app
  is in foreground (background = native-only, even bigger ask)
- Tag it as "user route data" — used to surface bathrooms along the
  user's typical paths, not to track them
- Aggregate-only sharing — never expose an individual's path to
  another user
- Apple App Review will scrutinize this hard. Worth it for the
  retention loop, but be ready to defend the privacy story.

### B2B owner mode
- Schools, hotels, casinos, malls, transit authorities, janitorial
  services
- Owner role: claim a bathroom, see issues reported, assign a
  cleaner, mark as cleaned
- Web dashboard (separate URL): /admin or app.gottago.app
- Pricing: $200–$2000/mo per facility (see BUSINESS_MODEL.md)
- Effort: **L+** — a real product on its own. Defer until consumer
  side has 50k+ MAU.

### Fixture data (counts of toilets, urinals, sinks, etc.)
- We now extract from OSM tags when present (Apr 2026)
- Most entries don't have these — capture from user uploads
- "Quick edit" form on each bathroom: add stall count, sink yes/no,
  paper towels yes/no, etc.
- Use these for richer filters: "≥ 3 stalls", "has changing table"
- Effort: **S** — UI exists; just need the form. Mostly waiting on
  user contributions to populate.

### Engagement loop (going to bathroom = reward)
- Streak counter ✓ shipped (Duolingo-style)
- Achievement system ✓ shipped (9 unlockables)
- Add: passive earning per verified data submission. Tier:
  - First contribution: ribbon, no money
  - 10th: $1 in store credit (offset against future Plus subscription)
  - 100th: $25 cash via Stripe
  - 1000th: lifetime Plus + featured contributor badge
- Effort: **M** — needs backend + Stripe Connect

### "Common places" inferred bathrooms ✓ shipped
- McDonald's / Starbucks / Costco / major gas stations show up as
  "Customer bathroom — buy something first"
- Inferred sources have lighter visual treatment (dashed amber
  border, lower priority in dedupe)
- Brand allow-list curated to avoid false positives

### Loading-screen mini-game ✓ shipped
- Toilet dino game during data fetch
- Persists best score in localStorage

### Mini-map preview on cards ✓ shipped
- 48px static OSM tile per alt card

### Distance unit auto-detect ✓ shipped
- US/Liberia/Myanmar → ft/mi; everyone else → m/km
- Override via `localStorage.gg_distance_unit = 'imperial'|'metric'`

### Address visibility ✓ shipped (alt cards now show street + city)

### Things explicitly NOT being built right now
- 10M downloads target — possible but requires sustained native-app
  growth (Capacitor → App Store → ranking → reviews → repeat). Year-2+
  scope.
- "Show ads everywhere" — ads only on details modal + below alt
  cards. Never on the GO button or hero. AdSense approval pending
  on Oscar's account setup.
- Real-money payouts — gated on Stripe Connect + backend + KYC


---

## Elder + accessibility-focused additions (April 2026)

A user request specifically asked for elder support. Comfort Mode
(toggle in the header — "A+" button) is the foundation. Here's what
to build on top of it.

### ✓ Comfort Mode (shipped)
- Bigger text (17px base, hero title 30px, GO button 22px)
- 44px+ tap targets everywhere
- Walking-time math at 55 m/min instead of 80 (elderly pace)
- Aurora dialed back to 35% opacity
- Calmer animations
- Toggle persists across sessions

### Bench / seating filter (NEW — P1)
- OSM tag: `bench=yes` on amenity nodes nearby
- Filter chip: "🪑 Bench" — show bathrooms within 50m of a bench
- For elders who need to rest on the way
- Effort: **S** (extends the Overpass query)

### Ground-floor only filter (NEW — P1)
- OSM tag: `level=0` or absence of stairs/elevator tags
- Some malls/transit have toilets only on upper levels with stairs
- Filter chip: "🚷 No stairs"
- Effort: **S** (tag check)

### Rest-stop chains (NEW — P2)
- Highway rest stops: AAA-rated, large stalls, often free
- Curated list: state DOT rest areas, Buc-ee's, Wawa, Sheetz, Pilot
- Already partially in commonPlaces; extend with `highway=rest_area`
  Overpass query
- Effort: **S**

### Senior centers + libraries (NEW — P2)
- Always-clean, always-staffed, always-accessible: senior centers,
  community centers, libraries, hospitals
- OSM tags: `amenity=community_centre|library|social_facility|hospital`
- Add to common-places-style query, label "Senior-friendly" badge
- Effort: **S**

### Voice mode for low-vision / motor difficulty ✓ shipped
- Web Speech API → "find a bathroom" / "next one" / "show map"
- Listening state visible (red pulse, transcript display)
- Already pairs well with Comfort Mode

### Future (needs backend or platform features)
- High-contrast theme variant (beyond midnight)
- Screen reader pass on the whole app (aria-live regions for hero
  swipe announcements, semantic landmarks)
- Native iOS Dynamic Type / Android FontScale support (Capacitor)
- Caregiver mode: a parent/child can watch where their elder went
  (with explicit consent on both sides; sensitive privacy story)
