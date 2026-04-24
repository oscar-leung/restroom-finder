# SEO Strategy

Restroom Finder has enormous long-tail search potential. Every "public
restrooms near me" or "[city] bathroom" query is exactly what the app
solves. The strategy is **programmatic geo-SEO**.

## Target queries (in priority order)

### Tier 1 — high volume, high intent (billions of searches in aggregate)
- "public restrooms near me" (~1M/mo)
- "bathrooms near me" (~600k/mo)
- "restrooms near me" (~400k/mo)
- "closest bathroom to me" (~200k/mo)

### Tier 2 — long-tail geographic
- "public restrooms in [city]" — every major city, 5k–50k/mo each
- "bathrooms at [college campus]" — each big campus 1k–10k/mo
- "accessible restroom [city]" — 500–2k/mo each

### Tier 3 — situational
- "bathroom emergency"
- "where to pee in [city]" (informal but common)
- "gender neutral bathroom [city]"
- "free public bathroom near me"

## Technical foundation (ship this first)

Add to `index.html`:

```html
<link rel="canonical" href="https://restroom-finder.app/" />
<meta property="og:image" content="/og-image.png" />
<meta property="og:url" content="https://restroom-finder.app/" />
<meta property="og:type" content="website" />
<meta name="twitter:card" content="summary_large_image" />
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Restroom Finder",
  "description": "Find the closest public restroom near you, instantly.",
  "applicationCategory": "UtilitiesApplication",
  "operatingSystem": "Web",
  "offers": { "@type": "Offer", "price": "0" }
}
</script>
```

Ship a `public/robots.txt`:
```
User-agent: *
Allow: /
Sitemap: https://restroom-finder.app/sitemap.xml
```

## Programmatic city pages (the big unlock)

### Why this works
Google loves unique, useful pages for specific queries. "Public restrooms in NYC" is a real query with weak current results. A page listing the top 20 NYC restrooms with walking directions, accessibility info, and neighborhood breakdown would rank within 2–3 months.

### Implementation plan (hand to software-engineer-agent)

1. Pick the top 50 US cities + top 20 college campuses as "seed locations".
2. At build time, fetch restrooms for each from Refuge + OSM.
3. Generate `/city/[slug]/index.html` pages. Each contains:
   - Unique ~250-word intro (the hard part — see next section)
   - Top 20 restrooms list with walking distances from city center
   - Neighborhood breakdown
   - Accessibility summary
   - Link back to the main app with location pre-selected
4. Add all pages to sitemap.xml.
5. Internal link between cities ("Planning to visit San Francisco? Check SF public restrooms").

### The copy problem

Each city page needs unique written content, not templated. Options:
- Hand-write the top 10 (NYC, LA, SF, Chicago, etc.)
- AI-generate for the rest, with human review for sameness
- Best: crowdsource from users via a "Did this help? Tell us about your local restroom situation" form

## Content marketing (slower, compounding)

Blog posts that rank and feed traffic back to the app:

| Topic | Target keyword | Estimated monthly search |
|---|---|---|
| "How to find a public bathroom anywhere" | bathroom emergency tips | 15k |
| "The best public restrooms in NYC" | public restrooms NYC | 8k |
| "Traveling with IBS: a bathroom-finding guide" | traveling with IBS | 12k |
| "Accessibility-first bathroom map of US cities" | accessible public restrooms | 6k |
| "College survival guide: campus bathroom tips" | college life tips | 40k (broader) |

Each post: 1000–1500 words, one primary keyword in title + H1 + first paragraph, 3–5 internal links to city/campus pages.

## What to measure

Set up **Google Search Console** on day 1 after deploy:
https://search.google.com/search-console

Weekly KPIs:
- Impressions (total)
- Average position for tier-1 keywords
- Click-through rate from SERPs
- % of sessions from organic search (aim for >50% within 6 months)
- Pages with at least one click (coverage)

## Anti-patterns

- Stuffing "bathroom restroom toilet" into meta descriptions
- Buying links from SEO services
- Creating "doorway pages" that redirect
- Using AI to generate 1000 near-identical city pages
- Chasing keywords the app can't actually satisfy

## 6-month goal

**Rank top 3 for "public restrooms near me" in at least 1 major US metro.**

That single ranking would drive ~10k monthly visits. Everything else
(campus pages, blog, backlinks) compounds from there.
