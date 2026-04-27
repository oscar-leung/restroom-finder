# Data Sources

Goal: every public bathroom that exists, in one merged feed, deduped
by lat/lng. Currently we hit ~30k entries; the leading competitor
claims 450k. The gap is reachable.

## Currently active

| Source | Coverage | Auth | License | Status |
|---|---|---|---|---|
| **Refuge Restrooms** | ~30k, US-heavy | None | Public | ✅ Live |
| **OpenStreetMap (Overpass)** | global; uneven density | None | ODbL | ✅ Live |
| **User-contributed** | local-only (each device) | None | Personal | ✅ Live |

## Tier 1 — add next (free, no auth, big coverage gains)

| Source | Endpoint | Notes |
|---|---|---|
| **Wikidata `Q3536437` (toilet)** | SPARQL: `query.wikidata.org/sparql` | Cross-references, multilingual names, hours where known |
| **NYC Open Data — Public Restrooms** | `data.cityofnewyork.us/resource/i7jb-7jku.json` | ~1,000 NYC entries with hours + accessibility |
| **SF Open Data — Pit Stops** | `data.sfgov.org/resource/3vjz-pa3v.json` | SF pit stop locations |
| **LA Open Data** | `data.lacity.org` (search "restroom") | LA County |
| **Seattle Open Data** | data.seattle.gov | Parks Dept restroom locations |
| **Chicago Open Data** | data.cityofchicago.org | Chicago Park District restrooms |

Each one is a few hundred to a few thousand entries — geographically
concentrated. Add city-by-city, behind feature flag `data_source_<city>`,
roll out to that city's users first.

## Tier 2 — paid but cheap, big-quality data

| Source | Pricing | Notes |
|---|---|---|
| **Google Places API** | $17 per 1k requests | Best signage, photos, hours. Use only on detail-view, not search, to keep costs sane. |
| **Foursquare Places** | Free 100k req/day | Solid name + address quality. |
| **Yelp Fusion** | Free 5k/day | "Public restroom" search returns businesses with public-friendly bathrooms. |

These shouldn't be primary search — they're enrichment for entries
you already have, fetched lazily on the details panel.

## Tier 3 — community / scraped

| Source | Notes |
|---|---|
| **Toilet Finder app** (closed source) | We can't scrape it. Don't even try. |
| **PublicWashroomFinder** (Canada) | Volunteer site, ask for data dump. |
| **Bathroom Scout** | Several countries, smaller. |

## Pulling it together

The merge function in `src/services/restroomApi.js` already accepts
arbitrary sources. Pattern for adding one:

```js
// src/services/dataSources/nyc.js
export async function fetchNYC(lat, lng, radiusMeters = 2000) {
  const url = `https://data.cityofnewyork.us/resource/i7jb-7jku.json` +
    `?$limit=200&$where=within_circle(location, ${lat}, ${lng}, ${radiusMeters})`;
  const res = await fetch(url);
  const rows = await res.json();
  return rows.map((row) => ({
    id: `nyc-${row.facility_name}-${row.latitude}`,
    source: "nyc",
    name: row.facility_name || "NYC Public Restroom",
    street: row.location_1 || "",
    city: "New York",
    latitude: Number(row.latitude),
    longitude: Number(row.longitude),
    accessible: row.handicap_accessible === "Yes",
    unisex: false,
    upvote: 0,
    downvote: 0,
    opening_hours: row.hours_of_operation,
  }));
}
```

Then in `restroomApi.js`:
```js
import { fetchNYC } from "./dataSources/nyc";
// ...inside fetchNearbyRestrooms:
const sources = await Promise.allSettled([
  fetchRefuge(lat, lng),
  fetchOSM(lat, lng),
  fetchNYC(lat, lng),
]);
```

`Promise.allSettled` so one bad source doesn't kill the whole list.

## Dedupe strategy

Current: lat/lng within 50m considered the same place.

For 100k+ entries from many sources, upgrade to:
1. Spatial bucket by 5-decimal lat/lng (~10m grid)
2. Within bucket, fuzzy-match name (Levenshtein ≤ 3 OR shared 4+ char
   prefix on normalized name)
3. Keep the entry with most fields filled, merge `accessible` /
   `unisex` flags as OR-of-sources, prefer Refuge's name over OSM's
   `amenity:toilet` placeholder.

## Honesty

Reaching 450k means weeks of work, not hours. Order of impact:
1. NYC + SF + LA + Chicago + Seattle (~5k high-quality entries, fast)
2. Wikidata SPARQL (~20k more globally, fast)
3. Google Places enrichment on details (no count gain but huge quality
   gain, slow per-detail latency)

Coverage outside the US will always be patchier than inside without
a paid source. Be honest in copy: "X bathrooms within 2km, sourced
from Refuge Restrooms, OpenStreetMap, and contributors."
