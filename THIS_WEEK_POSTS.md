# This week's posting plan

> Live: https://oscar-leung.github.io/restroom-finder/
> Repo: https://github.com/oscar-leung/restroom-finder
> Tip jar (mention only when format allows): https://buymeacoffee.com/holymushy

Rules of the road:
- No exclamation marks. No hashtag salad. No fake enthusiasm.
- Reply for the first 60-90 minutes after each post or it dies.
- Don't cross-link your own posts. Don't mention the tip jar in health subs.
- If a mod removes something, DM them, don't repost.

---

## Day 1 (TONIGHT) — 15 minutes total

Order: do them in this sequence. r/SideProject first because it's the friendliest audience and warms you up. r/InternetIsBeautiful second — best traffic upside. r/webdev third — short, low-stakes.

### 1. r/SideProject (5 min)

- **Submit page:** https://www.reddit.com/r/SideProject/submit
- **Flair:** "Show & Tell" or "Project"
- **Title (paste exactly):**

  I built a no-signup bathroom finder because the existing apps only let you rate, not update

- **Body (paste exactly):**

  Live: https://oscar-leung.github.io/restroom-finder/

  Two things bugged me about every existing toilet-finder app:

  1. The biggest one only lets you rate places. If a bathroom got a code-lock or closed, there's no way to fix the listing.
  2. Most of them won't let you add a place unless you're physically standing on it.

  So I built Gotta Go. Opens to one big GO button. Tap it, you get the closest public restroom to where you are, one more tap opens directions in Apple or Google Maps. Swipe to skip to the next-nearest if the first one is closed.

  Anyone can update any bathroom — name, hours, accessibility, gender-neutral, whether it's free, the lot. You can also add one remotely from anywhere; it doesn't lock you to GPS. Optionally syncs the new entry to Refuge Restrooms so the open data improves.

  Filters: accessible / gender-neutral / free / open-now. There's also a streak counter, achievements, and a Toilet Roulette button if you want to be sent somewhere random.

  Stack: PWA today, native iOS/Android via Capacitor in progress. Free, no ads, no signup.

  Honest caveats: reviews are device-local for now (sync is roadmap). Coverage is good in US metros and patchier in smaller towns.

  Roast it.

---

### 2. r/InternetIsBeautiful (7 min)

- **Submit page:** https://www.reddit.com/r/InternetIsBeautiful/submit
- **Title (paste exactly):**

  Gotta Go — opens to the closest public bathroom, one tap to directions, no signup

- **Body (paste exactly):**

  https://oscar-leung.github.io/restroom-finder/

  Big GO button on the homepage. Tap it, get the nearest public bathroom to where you're standing, one more tap opens turn-by-turn in Apple or Google Maps. Swipe to skip to the next-nearest. Filters for accessible, gender-neutral, free, and open-now.

  Data is Refuge Restrooms + OpenStreetMap merged and deduped. Anyone can edit any listing — most existing apps only let you rate, which I never understood.

  No signup, no ads, installable as a PWA.

---

### 3. r/webdev "showoff Saturday" or weekly thread (3 min)

- **Submit page:** https://www.reddit.com/r/webdev/ — find the pinned "Showoff Saturday" or "What are you working on?" thread and reply as a comment.
- **Comment (paste exactly):**

  Gotta Go — https://oscar-leung.github.io/restroom-finder/

  No-signup public-bathroom finder. One GO button to the closest one, swipe for the next, one more tap opens directions. Filters for accessible / gender-neutral / free / open-now. PWA today, Capacitor wrapper for iOS/Android in progress.

  Data: Refuge Restrooms + OSM, deduped. Built solo, would take any feedback on the GO-button UX.

---

## Day 2 — 20 minutes total

### 1. Indie Hackers (10 min)

- **Submit page:** https://www.indiehackers.com/post/new
- **Group:** "Show IH"
- **Title (paste exactly):**

  Gotta Go: a public bathroom finder where you can actually update the listings

- **Body (paste exactly):**

  Live: https://oscar-leung.github.io/restroom-finder/

  The market for "find a bathroom" apps is genuinely bad. The category leader on iOS only lets you rate listings — there's no way to fix the info if a place changes hours or installs a code-lock. Another popular one shows you addresses instead of names and refuses to let you add a place unless your phone's GPS says you're standing on it.

  Gotta Go is the no-signup version. The home screen is a GO button. Tap once, get the closest restroom, tap again for turn-by-turn directions. Swipe to skip if the first one is closed. Filters for accessible, gender-neutral, free, open-now. Anyone can edit any entry. You can add a place remotely.

  Other bits I'm experimenting with: a streak counter, an achievement system, a personal heatmap of your "usuals," and a Toilet Roulette button.

  Tech: React PWA today, Capacitor wrappers for iOS/Android in progress. Refuge Restrooms + OpenStreetMap, deduped.

  Looking for: feedback on the first-tap experience, and any city where the data feels thin so I can prioritize.

  Tip jar if it saves your day: https://buymeacoffee.com/holymushy

---

### 2. Hacker News "Ask HN" or comment seeding (10 min)

Don't do Show HN yet — save it for the polished launch later this week (see Bonus). Today, do this:

- **Search:** https://hn.algolia.com/?q=bathroom and https://hn.algolia.com/?q=public+restroom — sort by Date.
- **Find one recent thread** about public bathrooms, accessible toilets, or "no public restrooms in <city>" and leave a single useful comment.
- **Comment template (paste, edit to fit the thread):**

  Adjacent to this — I built https://oscar-leung.github.io/restroom-finder/ for the same problem. It merges Refuge Restrooms and OpenStreetMap into one map, opens to the closest one with a single tap, and lets anyone edit any listing (the major apps only let you rate, which I never understood). No signup. Coverage in [city] is [decent / patchy] from a quick check.

  Replace `[city]` with the city the thread is about.

---

## Day 3-5 — answer-seeding (10 min/day)

This is the highest-ROI tactic. Do not make top-level posts in these subs. Find an existing question and answer it usefully first; mention Gotta Go second, only if it actually fits.

### 1. r/IBS

- **Search URL:** https://www.reddit.com/r/ibs/search/?q=bathroom&restrict_sr=1&sort=new
- **Also try:** `q=public+bathroom`, `q=travel`, `q=where+to+go`
- **Comment template (under 100 words):**

  Not selling anything — I built a small free thing for exactly this kind of moment. https://oscar-leung.github.io/restroom-finder/ opens straight to the closest public bathroom and one more tap gives you directions. Filters for accessible and gender-neutral. No signup, no ads. Reviews are stored on your own device for now. Hope it saves someone an afternoon.

- **Do not mention:** the tip jar, achievements, streaks, Toilet Roulette. Don't frame it as a launch. Don't post a top-level thread — only reply when someone is asking.

### 2. r/CrohnsDisease

- **Search URL:** https://www.reddit.com/r/CrohnsDisease/search/?q=bathroom&restrict_sr=1&sort=new
- **Also try:** `q=travel`, `q=public+restroom`, `q=anxiety+about+bathrooms`
- **Comment template (under 100 words):**

  A friend with Crohn's was the reason I built this — sharing in case it helps. https://oscar-leung.github.io/restroom-finder/ — one tap to the closest public bathroom, one more tap opens directions. Accessibility filter when the source data has it. No signup, no ads, free. If the coverage is weak where you live, telling me actually helps me fix it.

- **Do not mention:** the tip jar (don't ask for money in a chronic-illness sub), the link as the lead — start with empathy and only paste the link if it directly answers the question. No streaks/achievements language. Never mark as "launch" or "promo".

### 3. r/AskNYC

- **Search URL:** https://www.reddit.com/r/AskNYC/search/?q=bathroom&restrict_sr=1&sort=new
- **Also try:** `q=public+restroom`, `q=where+can+I+pee`, `q=toilet`
- **Comment template (under 100 words):**

  For midtown your best safe bets are the [hotel lobby / Bryant Park / department store on 5th] — name 1-2 specific places relevant to where they're asking. If you want a map of public ones across the city: https://oscar-leung.github.io/restroom-finder/ — opens to the closest one, free, no signup. NYC coverage is decent but not perfect; you can also add a spot you know about.

- **Do not mention:** Buy Me a Coffee. Lead with a real, specific NYC answer — locals downvote anything that reads like a bot. The link is a follow-up, not the answer.

### 4. r/travel

- **Search URL:** https://www.reddit.com/r/travel/search/?q=bathroom&restrict_sr=1&sort=new
- **Also try:** `q=public+toilet`, `q=where+to+pee`, `q=long+layover+bathroom`
- **Comment template (under 100 words):**

  For unfamiliar cities I've been using https://oscar-leung.github.io/restroom-finder/ — it merges Refuge Restrooms and OpenStreetMap, opens to the closest one with one tap, and shows accessible / gender-neutral / free / open-now filters. No signup. Works as a PWA so you don't need to install anything. Coverage outside the US varies — Western Europe is solid, Southeast Asia is patchier.

- **Do not mention:** tip jar, "I built this" framing in r/travel works fine but stay matter-of-fact. Don't oversell global coverage — be honest about where it's thin.

### 5. r/AskSF (preferred over r/sanfrancisco — that one is stricter on self-promo)

- **Search URL:** https://www.reddit.com/r/AskSF/search/?q=bathroom&restrict_sr=1&sort=new
- **Also try (r/sanfrancisco fallback):** https://www.reddit.com/r/sanfrancisco/search/?q=public+bathroom&restrict_sr=1&sort=new
- **Comment template (under 100 words):**

  For [neighborhood], [name a real place — Whole Foods on 4th, the public toilet at Powell BART, etc.]. Broader: https://oscar-leung.github.io/restroom-finder/ has SF mapped out — one tap to the closest, filters for accessible and gender-neutral. Free, no signup. SF coverage is one of the better metros because of OSM density in the Bay.

- **Do not mention:** the tip jar. r/sanfrancisco mods are aggressive about self-promo; if posting there, lead with a real specific SF answer and only paste the link if directly asked or if it clearly fits. r/AskSF is more permissive.

---

## Day 6-7 — long-form

### Twitter/X thread (5 tweets)

Lead with ANGLE A — the strongest because it has a verbatim user quote behind it.

**1/**
The most popular toilet-finder app on iOS has 10M+ downloads and a top review that says, verbatim: "no way to update the info on existing toilet listings beyond ratings."

So if a place closes, gets a code-lock, or moves, the listing just stays wrong. Forever.

**2/**
The second-biggest one has the opposite problem. It shows you a street address instead of a name (so "1234 Main St" instead of "Starbucks"), and it won't let you add a place unless your phone's GPS says you're physically standing on it.

**3/**
I built Gotta Go to fix both. Anyone can update any listing — name, hours, accessibility, gender-neutral, all of it. You can add a place remotely from anywhere. Names instead of addresses. https://oscar-leung.github.io/restroom-finder/

**4/**
The home screen is one GO button. Tap once, get the closest restroom. Tap again, opens directions in Apple or Google Maps. Swipe to skip to the next one if it's closed. Filters: accessible, gender-neutral, free, open-now. No signup, no ads.

**5/**
Data merges Refuge Restrooms and OpenStreetMap, deduped. PWA today; native iOS/Android via Capacitor coming. Free.

If the coverage where you live is bad, telling me actually fixes it — I prioritize the cities people complain about.

---

### LinkedIn post

Use ANGLE C ("Closest answer in one tap. No list to scroll, no city lock-in.") with a builder framing.

**Paste exactly:**

A small thing I shipped on the side: Gotta Go — https://oscar-leung.github.io/restroom-finder/

The premise is unromantic. Existing public-bathroom apps either make you sign up, hide the answer behind a list of pins to tap through one by one, or lock you into one city. The home screen of Gotta Go is a single GO button. Tap it, you get the closest public restroom to wherever you're standing, and one more tap opens turn-by-turn directions in your maps app.

Three product decisions worth calling out:
- No signup. The product has to work in 0.5 seconds when you actually need it.
- Anyone can edit any listing, not just rate it. Most apps in this space only allow ratings, which made the data slowly rot.
- You can add a bathroom remotely. You shouldn't have to be standing on a place to put it on the map.

It's free, no ads, built solo. Data merges Refuge Restrooms with OpenStreetMap. PWA today; native iOS/Android via Capacitor in progress.

If you have a chronic condition, travel often, or just have a kid who announces these things with no warning — I'd love to know whether the first tap does what you expected.

---

## Bonus: Hacker News Show HN (when ready)

Save for a Tuesday or Wednesday at 9am ET. One shot per project.

- **Submit page:** https://news.ycombinator.com/submit
- **Title (paste exactly):**

  Show HN: Gotta Go – I built this because no other bathroom app lets you update entries

- **URL field:** https://oscar-leung.github.io/restroom-finder/

- **First comment (paste exactly, post within 30 seconds of submitting):**

  Solo builder here. The trigger for this was reading the reviews on the existing apps. The most-installed one's top complaint, verbatim, is that there's "no way to update the info on existing toilet listings beyond ratings." The second has a top complaint that you can't add a place unless your GPS says you're physically there.

  Both seemed like the wrong defaults for a utility this basic, so:

  - Anyone can edit any listing (name, hours, accessibility, gender-neutral, free, open-now).
  - You can add a place remotely. Optionally pushes the new entry to Refuge Restrooms.
  - The home screen is one GO button. Tap once for the closest, tap again for directions. Swipe to skip.
  - No signup, no ads. PWA today; iOS/Android via Capacitor in progress.

  Data is Refuge Restrooms + OpenStreetMap merged and deduped. Reviews are device-local for now (cross-device sync is roadmap, not shipped — would rather say that than hand-wave).

  Things I'd actually like feedback on:
  1. Is the first tap obvious? The product lives or dies on that interaction.
  2. Where's the data thin? I prioritize the cities people complain about.
  3. The "edit any listing" model — is there a moderation pattern that doesn't end in vandalism? Refuge mostly relies on social trust; OSM has a versioning model. Curious what HN would do.

  Not trying to be a social network. Just trying to make the closest decent bathroom one tap away.

---

## What to measure this week

- Unique sessions per day (Plausible / GA4).
- GO-button taps as % of sessions. If <30%, the hero UX is the problem, not distribution.
- "Add a bathroom" submissions (your strongest signal of real engagement).
- Source breakdown — which Reddit / HN / LinkedIn referrer actually drove visits.
- Any mention or backlink from a non-Oscar source.
