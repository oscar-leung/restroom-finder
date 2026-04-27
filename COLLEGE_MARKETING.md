# College Student Launch Plan

College students are the highest-leverage audience for this app:
- Dense geography (20k+ students per square mile on big campuses)
- Constant walking between buildings with unclear bathroom locations
- Heavy TikTok / Instagram Reels user base — perfect virality surface
- Low resistance to new free apps

## Week 1: Seed 5 campuses

Pick 5 schools where you already have connections or large student
populations. Suggested starter list:

1. **UC Berkeley** (44k students)
2. **UCLA** (47k)
3. **NYU** (59k)
4. **UT Austin** (52k)
5. **Sac State** (31k — your local angle)

For each campus:

1. **Seed OSM data** — check https://www.openstreetmap.org for the campus; if bathroom tags are thin (fewer than ~20 `amenity=toilets` nodes), ask OSM contributors on the local OSM mailing list to tag them. Or do a few yourself.
2. **Build a campus landing page** (`/ucla`, `/ucberkeley`, etc.) — SEO agent's job. Page lists the top 20 bathrooms on campus with walking times from the library.
3. **Pre-launch outreach**: DM the school subreddit mods 48 hours before posting to check rules and tone. r/berkeley, r/ucla, r/nyu are all active.

## Week 2: The TikTok play

College TikTok is where this wins. Three content patterns that work:

### Pattern A: "POV" videos
Example script:
> "POV: it's 2am in the library, you've had 4 coffees, and you don't
> know where the closest bathroom is. Let me show you the app that
> saved my finals week."
[Screen recording of app → GO button → Apple Maps opening]

### Pattern B: Campus-specific tours
> "The 5 bathrooms at UCLA you should know about"
Short clips at each location with the app in the corner showing walking time.

### Pattern C: The emergency
> "My friend has IBS and we built this for her. Here's how it works."
(This one needs to be sincere. If you don't have that story, don't fake it.)

**Who to reach out to**: micro-influencers with 5k–50k followers in the
"college life" niche. They're hungry for content ideas and have high
engagement. Don't pay — offer them co-credit.

## Week 3: The student newspaper play

Every big campus has a student newspaper. They run "apps every student
should have" pieces constantly because they need filler content.

**Email template** (customize per school):

> Subject: Free app built by a student for finding campus bathrooms
>
> Hi [editor],
>
> I built a free web app called Gotta Go — it shows the closest
> bathroom on campus, one tap to directions. No signup. I used it 30+
> times during my own finals and figured other students might find it
> useful.
>
> Would [newspaper name] be open to a short piece or mention? Happy
> to send screenshots, share data on how students are using it, or
> jump on a 10-minute call.
>
> Live demo: https://oscar-leung.github.io/restroom-finder/
> Source: https://github.com/oscar-leung/restroom-finder
>
> Thanks,
> Oscar

Send 10 of these. You'll probably get 2 replies and 1 piece. That piece
will drive more signups than a paid ad campaign.

## Week 4: Partner with disability services offices

Every university has a Disability Resource Center. They publish
accessibility guides. Reach out:

> Hi, I built a free app that maps accessible bathrooms (with
> wheelchair and gender-neutral info from OpenStreetMap + Refuge
> Restrooms). Would the DRC consider linking to it from your
> accessibility resources page?

This gets you high-quality backlinks (great for SEO) AND puts the
product in front of the audience that benefits most.

## What to measure (weekly)

Metrics that tell you "college students are using it":
- **% of sessions geolocated within 5 miles of a target campus**
- **Unique devices per campus**, week over week
- **`go_clicked` events per session** (engagement depth)
- **Retention curve by campus** — is Week-2 retention above 20%?

If Week-2 retention is below 10%, something is wrong with the product,
not the marketing. Circle back to frontend-agent.

## Anti-patterns (don't do these)

- **Paid ads before product-market fit.** You'll burn $1000 to learn
  nothing new. Organic first.
- **Generic "check out my app" posts in college subreddits.** Instant
  downvote. Come with a story.
- **"Going viral" as a goal.** Virality is a side effect. Usefulness
  is the goal.
- **Buying TikTok promotion before you have genuinely good content.**
  Amplifying boring content just shows more people something boring.
