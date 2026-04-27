# Launch Posts — Copy, tweak, ship

Fill in `{LIVE_URL}` with your Vercel URL once it's live. Everything else
is drafted to the tone of each platform.

## Before you post anywhere, a checklist

- [ ] App is live on a real URL (Vercel)
- [ ] Tip jar link works (BMC username swapped in)
- [ ] You've tested it on your phone (not just desktop)
- [ ] App icon looks right when you install it to home screen
- [ ] Tested in at least one other city (use browser devtools
      geolocation override → try Tokyo, London — make sure API returns
      results globally)

---

## 1. Product Hunt (biggest launch — Tuesday 12:01 AM PT is best slot)

**Title** (60 char max):
```
Gotta Go — Instantly find the closest public bathroom
```

**Tagline** (60 char max):
```
Opens straight to the closest restroom. One tap to directions.
```

**Description**:
```
I built this because I've needed it a dozen times traveling and every
existing app buried the answer behind menus, filters, and ads.

Open it → you see the single closest restroom with distance, walking
time, and a huge GO button that deep-links to Apple/Google Maps. That's
it. No account, no signup, no fluff.

Under the hood:
• 30,000+ restrooms from the Refuge Restrooms open API
• Works in 50+ countries
• Installable as a PWA on iOS + Android home screens
• Accessibility and gender-neutral filters
• Free forever for the core "find one now" flow

Native iOS/Android apps coming soon. Built solo in React + Vite +
Leaflet. Feedback very welcome.
```

**Topics to pick**: Travel · Health & Fitness · Maps · Accessibility

**First comment you post on your own listing** (this matters — it drives
engagement):
```
Hey PH 👋 maker here. I got tired of opening Google Maps, searching
"bathroom", squinting at 40 pins, picking one, then realizing it's
closed — all while being in an actual hurry. So I built the dumbest
possible version of the right thing: open → see closest → go.

Would especially love feedback from folks with IBS/Crohn's, travelers,
and parents on whether this fits your workflow. The native apps will
add offline mode for that moment when your signal drops in a subway.
```

---

## 2. Reddit r/InternetIsBeautiful (500k subs, loves minimal utility)

**Title**:
```
I built a site that shows you the closest public restroom, instantly
```

**Body**: (they prefer short)
```
{LIVE_URL}

Opens → shows the nearest restroom with walking time and a GO button
to directions. No signup, no menus.

Uses the Refuge Restrooms open API, so it has ~30k locations globally
plus accessibility and gender-neutral info.

Built it because I've needed it in a hurry more than once while
traveling. Feedback welcome.
```

**Rules to respect**: no self-promo flair unless asked; respond to
comments for 24h after posting; post Sunday evening or Monday morning
US time for max reach.

---

## 3. Reddit r/sideproject

**Title**:
```
Shipped: a "closest restroom now" app because every existing one was too cluttered
```

**Body**:
```
{LIVE_URL}
Repo: https://github.com/oscar-leung/restroom-finder

Stack: React + Vite + Leaflet, data from the Refuge Restrooms public
API. Deployed as a PWA to Vercel. Capacitor-ready for iOS/Android.

Design principle was: if someone opens this app, they're not browsing,
they're hurrying. So the app opens onto the single closest restroom
with a huge GO button. Alternatives are a swipe away.

Next on the roadmap:
- AdMob / AdSense monetization (see MONETIZATION.md in repo — trying
  to be honest with myself about realistic numbers)
- iOS + Android native apps via Capacitor
- Offline mode for the "no signal in the subway" case

Happy to answer anything about the stack, the monetization math, or
the decision to make the map secondary instead of primary.
```

---

## 4. Reddit r/Crohns and r/IBS — **TREAD CAREFULLY**

These subs are sensitive. **Do not post as marketing.** Contribute first
(actually read the sub, upvote, comment supportively for a week), then
post once as a fellow sufferer / friend-of-sufferer.

**Title**:
```
Made this so my friend with IBS could find a bathroom faster — sharing in case it helps anyone here
```

**Body**:
```
My friend has IBS and we've been stuck in a dozen situations where the
existing map apps just weren't fast enough. Built this over a weekend:
open it and it shows the closest public restroom with directions. No
signup, no ads (for now).

{LIVE_URL}

It's free. It uses crowdsourced data so coverage varies a lot by city.
If you try it and it misses spots near you, there's a contribute link
to Refuge Restrooms where entries come from. More coverage helps
everyone.

I'm not selling anything and I'll shut up about it — just wanted to
share in case it helps one person.
```

Do NOT include tip jar mentions or anything commercial in these posts.
If people ask, you can say "the site has a tip jar for folks who want
to support it, but you should not feel you need to."

---

## 5. Hacker News — "Show HN"

HN is technical. They want to see the craft.

**Title**:
```
Show HN: Gotta Go – opens straight to the closest one, one tap to directions
```

**Body**:
```
{LIVE_URL}
Source: https://github.com/oscar-leung/restroom-finder

I got frustrated that every "bathroom finder" app buries the answer
behind menus and filters. So I built one where the first thing you see
IS the answer.

Stack: React 18 + Vite + Leaflet + react-leaflet. Data from the Refuge
Restrooms public API (~30k locations globally). Haversine for distance
sorting, flyTo-animated map, PWA manifest so it installs to the home
screen on iOS/Android. Capacitor is set up so native app builds are
a `cap add` away.

Design decisions I'd love critique on:
1. Map as secondary (overlay) instead of primary. Classic restroom
   finders are map-first; I argue that in an emergency, list-first with
   the answer front-and-center is faster.
2. Geolocation has a 5s soft timeout falling back to a default city,
   because the permission prompt often sits un-answered.
3. Buy Me a Coffee + AdSense planned before native — see MONETIZATION.md
   for the phased revenue ladder with honest numbers.

Feedback welcome, especially on edge cases in international cities
where Refuge Restrooms coverage is thin.
```

---

## Launch-day rhythm

**Hour 0 (Tuesday 12:01 AM PT)**: Post on Product Hunt.
**Hour 3**: Post on HN Show HN (morning US traffic).
**Hour 6**: Post on r/InternetIsBeautiful + r/sideproject.
**Hour 12**: Share in a few niche Slack/Discord communities you're in.
**Day 2–3**: r/Crohns and r/IBS (only after you've contributed to them).
**Week 1**: DM 10 travel bloggers. Offer nothing — just "built this,
would love your honest take."
**Week 2**: Write one blog post ("Why I made the map secondary in a
restroom finder") and post on HN / dev.to / your own blog.

**What to watch for**: If you're getting users but they bounce in <10
seconds, something is broken (probably geolocation permission flow).
If they're engaging but not coming back, the retention loop isn't there
yet — time to add favorites / notifications.
