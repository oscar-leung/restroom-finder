/**
 * Wikidata — public toilets via SPARQL.
 *
 * Wikidata is the structured-data backbone of Wikipedia. It tracks
 * many notable public toilets as items of class Q35525 ("public
 * toilet") with coordinates. Coverage skews toward landmark and
 * historic toilets but adds entries OSM doesn't always have.
 *
 * SPARQL endpoint: https://query.wikidata.org/sparql (free, no key)
 * Fair-use: keep queries small + cached.
 */

const SPARQL_ENDPOINT = "https://query.wikidata.org/sparql";

const cache = new Map();

function buildQuery(lat, lng, radiusKm) {
  // Wikidata 'around' service — finds items within radiusKm of point
  return `
    SELECT ?item ?itemLabel ?coord ?article WHERE {
      SERVICE wikibase:around {
        ?item wdt:P625 ?coord .
        bd:serviceParam wikibase:center "Point(${lng} ${lat})"^^geo:wktLiteral .
        bd:serviceParam wikibase:radius "${radiusKm}" .
      }
      ?item wdt:P31/wdt:P279* wd:Q35525 .
      OPTIONAL { ?article schema:about ?item ; schema:isPartOf <https://en.wikipedia.org/> . }
      SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
    }
    LIMIT 30
  `.trim();
}

function parseCoord(literal) {
  // "Point(-122.4194 37.7749)" → { lat: 37.7749, lng: -122.4194 }
  const m = /Point\(([\-0-9.]+)\s+([\-0-9.]+)\)/.exec(literal);
  if (!m) return null;
  return { lng: Number(m[1]), lat: Number(m[2]) };
}

export async function fetchWikidata(lat, lng, radiusKm = 3) {
  const key = `${lat.toFixed(2)},${lng.toFixed(2)}`;
  if (cache.has(key)) return cache.get(key);

  const url = `${SPARQL_ENDPOINT}?query=${encodeURIComponent(buildQuery(lat, lng, radiusKm))}&format=json`;

  try {
    const res = await fetch(url, {
      headers: {
        "Accept": "application/sparql-results+json",
      },
    });
    if (!res.ok) return [];
    const data = await res.json();
    const bindings = data?.results?.bindings || [];

    const results = bindings
      .map((b) => {
        const coord = parseCoord(b.coord?.value || "");
        if (!coord) return null;
        const id = b.item.value.split("/").pop(); // Q123456
        return {
          id: `wikidata-${id}`,
          source: "wikidata",
          name: b.itemLabel?.value || "Public toilet",
          street: "",
          city: "",
          state: "",
          country: "",
          latitude: coord.lat,
          longitude: coord.lng,
          accessible: false,
          unisex: false,
          single_occupant: null,
          family: false,
          fee: null,
          opening_hours: null,
          directions: b.article?.value || null,
          comment: b.article?.value ? "Has Wikipedia article" : null,
          upvote: 0,
          downvote: 0,
        };
      })
      .filter(Boolean);
    cache.set(key, results);
    if (cache.size > 20) cache.delete(cache.keys().next().value);
    return results;
  } catch {
    return [];
  }
}
