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
