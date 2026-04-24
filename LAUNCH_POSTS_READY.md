# Restroom Finder — Launch Posts (Ready to Copy-Paste)

> Live: https://oscar-leung.github.io/restroom-finder/
> Source: https://github.com/oscar-leung/restroom-finder

---

## Launch-Day Rhythm

A loose timing plan. Stagger the posts so you can actually be present in each thread — replying in the first 90 minutes is what determines whether anything sticks.

**Sunday evening (US time, ~7–9pm ET)**
- Post to **r/InternetIsBeautiful**.
- First 90 min: refresh every 10–15 min. Reply to every top-level comment with something specific (not "thanks"). If someone reports a bug, fix-or-acknowledge in-thread.
- Don't link to the GitHub repo unless asked. The sub flags self-promo fast.

**Monday (buffer / soft day)**
- Watch r/IIB thread. Reply to late comments.
- Around midday US, post to **r/IBS**. Treat it as a community contribution, not a launch.
- First 90 min on r/IBS: reply only when someone asks a real question. Don't bump your own post. If mods remove it, don't repost — DM mods first.

**Tuesday morning (12:01am PT — Product Hunt day starts)**
- Schedule the **Product Hunt** post to go live at 12:01am PT. Title, tagline, description, topics, gallery already prepped.
- Drop the maker's first comment within the first 5 min.
- First 90 min after launch: reply to every comment, even one-word ones. Upvote-asks via DM are dead — don't do them. Share the PH link with people who already said they'd support, not a broadcast.
- Around 9am ET, post to **r/Crohns**. Same rules as r/IBS — community-first, no PH cross-link.

**24-hour success bar (honest, not aspirational)**
- Product Hunt: top 10 of the day = real win, top 5 = great. <300 upvotes is normal for a solo, design-light launch — don't read it as failure.
- r/InternetIsBeautiful: 200+ upvotes & a working comment thread = win. The traffic spike matters more than the karma.
- r/IBS / r/Crohns: 1–2 sincere "I'll try this next time I'm out" replies is the actual win. Don't measure these in upvotes.
- Site-side: 1k+ unique sessions across the day, 30%+ hit the GO button at least once, a handful of "add your own bathroom" submissions. If GO-button engagement is low, the hero UX is the problem, not distribution.

---

## 1. Product Hunt (Tuesday, 12:01am PT)

**Title (≤60 char):**
Restroom Finder — closest public bathroom, instantly

**Tagline (≤60 char):**
One tap to the nearest restroom, with directions

**Suggested Topics:**
Maps, Travel, Health & Fitness, Productivity, Open Source

**Description (~250 words):**

Restroom Finder opens straight to a big GO button. Tap it and you get the closest public bathroom to wherever you're standing, with one-tap directions in Apple or Google Maps. That's the whole pitch.

I built it because every existing "find a bathroom" app either makes you sign up, buries the answer three taps deep, or shows you the same gas station on repeat. The GO button is the differentiator — no map-panning, no list-scrolling, no "filter by distance" dropdown. You're shown one good answer and a swipe takes you to the next one if it's closed or you don't like the look of it.

Under the hood it merges Refuge Restrooms and OpenStreetMap, deduped, which works out to roughly 30,000+ restrooms with reasonable global coverage and dense US coverage. Accessibility and gender-neutral filters are first-class. There's a fullscreen map view if you want to browse, walking-time estimates, and an "add your own bathroom" flow that uses your GPS and can optionally publish to Refuge so the data improves for everyone.

Honest caveats: reviews are device-local for now (cross-device sync is on the roadmap, not shipped). Native iOS and Android wrappers via Capacitor are in progress — for today it's a PWA, which you can install to your home screen and it behaves like an app.

Free, no signup, no ads. Tip jar exists if it saves your day, but you should not feel you need to.

Built solo. Feedback welcome — especially the kind that hurts.

**First comment by the maker (Oscar):**

Hey PH — Oscar here, solo builder, QA background.

Quick honest version of how this came to be: a friend with IBS was visiting an unfamiliar city and spent twenty minutes Google-Mapsing "public bathroom near me," reading reviews, and hating every step of it. The thing she actually needed was one button that said "go here, it's two minutes away." So I built that.

A few things I'd genuinely love feedback on:

1. **Does the GO button do what you expected on first tap?** The whole product lives or dies on that one interaction.
2. **Refuge + OSM merge quality** — if you're somewhere with weird coverage (smaller cities, outside the US, college campuses) I want to hear where the data is wrong or thin.
3. **The "add a bathroom" flow** — is it obvious that you can contribute? Should it be more prominent?

Things I already know are rough and am working on:
- Reviews are device-local (localStorage). Sync is next.
- Native iOS/Android via Capacitor is in progress — PWA install is the workaround for now.
- The usage-pattern thing ("you usually go around 2pm") is a v1 experiment; tell me if it feels useful or creepy.

Not trying to be a social network or a bathroom-rating game. Just trying to make the closest decent bathroom one tap away. Roast it.

---

## 2. r/InternetIsBeautiful (Sunday evening or Monday morning US time)

**Title:**
Restroom Finder — opens to the closest public bathroom, one tap to directions

**Body:**

https://oscar-leung.github.io/restroom-finder/

Big GO button on the homepage. Tap it, get the nearest public bathroom to where you're standing, one more tap opens directions in Apple or Google Maps. No signup, no ads.

Data is Refuge Restrooms + OpenStreetMap merged and deduped. Has accessibility and gender-neutral filters when the source data has it. Swipe to skip to the next-nearest one. Works as a PWA if you want to install it.

Built it solo because the existing options all wanted me to sign up or scroll a list. Feedback welcome — particularly if the data is sparse where you live.

---

## 3. r/Crohns (Monday or Tuesday, US morning)

**Title:**
Built a small bathroom-finder for a friend with IBS — sharing in case it's useful for anyone here

**Body:**

A close friend has IBS and a few months ago was visiting a new city and had a bad time finding a bathroom fast. The existing apps either wanted a signup or buried the answer behind a list of pins to tap through one by one. I do software for a living so I told her I'd just make the thing she actually wanted.

It's at https://oscar-leung.github.io/restroom-finder/ — opens to a big GO button, that gives you the closest public bathroom to wherever you are, and one more tap opens turn-by-turn directions in your maps app. You can swipe past one if it's closed or sketchy. There's an accessibility filter and a gender-neutral filter. You can also add a bathroom you know about so the next person finds it.

Data comes from Refuge Restrooms and OpenStreetMap merged together, so coverage is decent in most US cities and patchier in smaller towns. I'd rather be honest about that than pretend it's perfect.

I'm not trying to advertise anything here — no signup, no ads, free to use. Just sharing it in case anyone in this sub is dealing with the kind of trip-planning anxiety she was. If it helps even a couple of people that's enough.

If folks here try it and tell me what's broken or missing, I'll keep working on it. Source is on GitHub: https://github.com/oscar-leung/restroom-finder

---

## 4. r/IBS (Monday midday US time)

**Title:**
A small web app for finding the nearest bathroom fast — built it after watching a friend struggle with this

**Body:**

This sub will know the feeling: you're out, the clock starts, and the existing "find a bathroom" options make you tap through a list or sign up for something before they'll tell you anything useful.

I built a small web tool that opens to one button. You tap it and it shows you the closest public bathroom to where you're standing. One more tap opens directions in Apple or Google Maps. If the first one is closed or feels wrong you can swipe to the next-nearest. That's the whole thing.

Link: https://oscar-leung.github.io/restroom-finder/

A few details that might matter to people here:
- No signup, no ads.
- Accessibility and gender-neutral filters when the source data has them.
- Walking time is shown so you know whether to commit or keep moving.
- You can add a bathroom yourself if you know one that isn't in there — uses your phone's GPS, takes about ten seconds.
- Reviews are stored on your own device for now (I'm working on syncing across devices but didn't want to ship a half-baked account system).

Data is from Refuge Restrooms and OpenStreetMap, so US coverage is reasonable and outside the US it varies. Telling me where it's thin actually helps — I can prioritize fixes.

Source: https://github.com/oscar-leung/restroom-finder

Genuinely just made this because urgency-finding a bathroom shouldn't be a five-tap experience. Hope it saves someone a bad afternoon.
