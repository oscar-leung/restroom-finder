# Reddit/HN Reply Templates

Comments on your launch posts will follow predictable patterns. These
are pre-drafted reply templates so you can respond fast (the first 60
minutes after a post matters more than the post itself).

**The honest take**: I (Claude) cannot see or post to your Reddit
threads — Reddit blocks agent navigation system-wide. So this is
the next-best play: when a comment lands, find the matching pattern
below, copy, tweak, paste. If something weird comes up, paste it
into our chat and I'll draft a custom reply.

---

## Pattern 1 — "This is great / cool / love it"

Don't just say thanks. Ask one specific question to keep the thread
going (drives engagement, helps the post climb).

> Thanks. Curious — were you planning to use it for travel or your
> regular city? I'm trying to figure out which use case to optimize
> for next.

---

## Pattern 2 — "Does it work in [city/country]?"

Be honest about coverage. Refuge + OSM is dense in US/EU metros,
patchier elsewhere. Common-places (McD/Starbucks) helps fill gaps.

> Should — Refuge Restrooms + OpenStreetMap + a curated list of 60
> chain brands (McDonald's, Starbucks, gas stations) all merge in
> automatically. Coverage in [CITY] is probably decent. If you try
> it and it's thin, telling me where it fails actually helps —
> there's an "add a bathroom here" flow that contributes back to
> the open data.

---

## Pattern 3 — "How is this different from [Toilet Finder / Flush / Google Maps]?"

Use the verbatim positioning from the competitor scan.

> Three things:
>
> 1. Closest answer first. Not a list, not a map you scroll. One
>    big GO button shows you the single nearest one with directions
>    a tap away. Toilet Finder/Flush both make you scroll a list.
> 2. You can update any bathroom — name, hours, accessibility,
>    everything. Flush only lets you change the rating. There's a
>    real review of theirs that says "no way to update the info on
>    existing toilet listings beyond ratings" — that's the gap.
> 3. Free, no signup, no ads. The tip jar exists if it saves you,
>    but you should not feel you need to.

For the Google Maps version, slim it down:

> Google Maps gives you 40 pins to scroll through. This gives you
> one. In an emergency, "one good answer" beats "best of 40."

---

## Pattern 4 — "Why no native iOS/Android app?"

> It's coming via Capacitor — the codebase is already wrapped, just
> need to ship the binaries. PWA today means you can install it to
> your home screen in Safari (iOS) or Chrome (Android) and it
> behaves like a real app. Native shells will add offline mode and
> push notifications. Aiming for App Store submission within 30
> days.

---

## Pattern 5 — "Privacy concerns / what about my location?"

> Location stays on your device. The app calls `navigator.geolocation`
> in your browser; the lat/lng never leaves your phone. Reviews,
> photos, visit history — all stored locally too. Analytics is
> Google Analytics 4, anonymized event-level only, no personal info.
> If you want to disable it, ad-blockers like uBlock Origin block
> gtag.js by default and the app still works.

---

## Pattern 6 — "What's your business model?"

> Free forever for the core flow. Three planned revenue legs:
> (1) display ads on the details modal, (2) optional "Plus" subscription
> for offline + ad-free + cross-device sync, (3) B2B for venues that
> want to keep their bathroom listings fresh. Everything's documented
> publicly in BUSINESS_MODEL.md in the repo if you want the numbers.
> The tip jar that's there now isn't really revenue — it's a thank-you
> button.

---

## Pattern 7 — Negative / dismissive comment

Don't get defensive. Acknowledge, ask, move on.

> Fair — what specifically made it feel that way? Genuinely want to
> know what to fix.

If they say "this already exists":

> You're right, there are existing apps. The pitch is the UX — open
> straight to the answer instead of scrolling a list. If you've used
> one of the alternatives and it solves your problem, that's
> totally fine; this is for the people who found those frustrating.

---

## Pattern 8 — Bug report

Thank them, ask for details, file it.

> Thanks — that's useful. To repro: were you on iOS Safari /
> Android Chrome / desktop? And do you remember roughly where you
> were when it happened (city is fine; lat/lng not needed)?
> Filing it now.

After fixing:

> Fixed — should be live in the next deploy (~30 sec on push). Let
> me know if you still see it.

---

## Pattern 9 — Feature request

Either "great, in roadmap" or "great, here's why I'm hesitant."

If it's something you want:

> Yes, that's on the roadmap (item #X in ROADMAP.md). Want to
> follow along? The repo's at github.com/oscar-leung/restroom-finder
> and I open feature PRs there.

If it's something you don't think you'll do:

> Real consideration: I've thought about this and the trade-off was
> [SHORT REASON]. Open to changing my mind if you've got a use case
> I haven't seen.

---

## Pattern 10 — Compliment on a specific feature

(e.g. "the toilet dino game is a nice touch")

Don't just smile. Pull more from them.

> Thanks. Was a 2 AM idea. Curious if you'd actually use it as a
> game or if you'd skip if there were a "skip" button.

---

## Pattern 11 — "Show HN: did you use AI to build this?"

Be direct. HN respects the truth.

> Yes — Claude pair-coded most of it with me. The architecture
> decisions, the UX trade-offs, the "ship the dumbest right thing"
> philosophy were mine; the typing was Claude's. Both visible in
> the repo's commit history.

---

## Pattern 12 — Existential / philosophical

(e.g. "Why does the world need another bathroom app?")

> It probably doesn't. I built it because nothing existing felt
> right when I needed it. If it works for me and a few other
> people, that's enough. If it works for 10 million, even better.

---

## When in doubt

- Reply within 60 minutes if you can; the post lives or dies in the
  first 90.
- Don't argue with mods. If something gets removed, DM the mod.
- Don't link to your own posts across subs — auto-flagged as
  spammy. Comment-seeding (helping in existing threads) is fine.
- Save screenshots of nice comments for a TESTIMONIALS.md you can
  paste into the next round of marketing.

## Common HN-specific patterns

HN runs analytical and a little snarky. Slightly different tone:

> [HN comment: "the design isn't really that different from X"]

Reply:

> You're right that visually they overlap. The behavioral
> difference: X opens to a list. We open to a single answer.
> That's the whole bet — that one good answer beats fifty unranked
> ones. Wrong about it? Maybe. But the A/B framework is wired and
> I'll know in 30 days.

Don't apologize, don't oversell. Show your thinking.
