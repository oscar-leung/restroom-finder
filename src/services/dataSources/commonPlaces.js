/**
 * Common Places — businesses that reliably have customer-accessible
 * bathrooms even if not formally tagged with `amenity=toilets`.
 *
 * We hit OSM Overpass for `amenity=fast_food/restaurant/cafe/fuel`
 * filtered to a curated brand allow-list. These are tagged with
 * source="inferred" so the UI can show a softer treatment ("Bathroom
 * usually available — buy something first").
 *
 * Why a brand allow-list: not every diner is bathroom-friendly. The
 * brands below have either an explicit public-restroom policy
 * (Starbucks since 2018) or are essentially universal (McDonald's,
 * Costco, major gas chains). We err on the side of fewer false
 * positives — a wrong "yes there's a bathroom" is a worse user
 * experience than a missing entry.
 */

// Quoted brand names (as they typically appear in OSM `brand` tags).
// All-lowercase comparison — we normalize before matching.
const BRAND_ALLOWLIST = new Set([
  // Fast food (universal)
  "mcdonald's", "mcdonalds", "burger king", "wendy's", "wendys",
  "taco bell", "kfc", "subway", "chipotle", "panera bread", "panera",
  "in-n-out burger", "in-n-out", "shake shack", "five guys",
  "popeyes", "popeye's", "chick-fil-a", "white castle",
  "jack in the box", "carl's jr.", "carls jr", "hardee's", "hardees",
  "arby's", "arbys", "jersey mike's", "jimmy john's",
  // Coffee
  "starbucks", "dunkin'", "dunkin", "tim hortons", "peet's coffee",
  "peets coffee", "caribou coffee", "philz coffee", "blue bottle",
  // Gas / convenience (24/7 availability often)
  "shell", "bp", "chevron", "exxon", "exxonmobil", "mobil",
  "76", "arco", "sunoco", "valero",
  "7-eleven", "7eleven", "circle k", "wawa", "sheetz",
  "buc-ee's", "kwik trip", "casey's general store",
  "quiktrip", "quik trip", "racetrac", "race trac", "speedway",
  // Big-box (almost always have customer bathrooms)
  "costco", "costco wholesale", "target", "walmart", "ikea",
  "home depot", "lowe's", "lowes", "best buy",
  // International (light coverage)
  "pret a manger", "pret", "costa coffee", "costa",
  "nero", "caffè nero", "greggs",
]);

// OSM amenity types worth querying
const AMENITY_TYPES = ["fast_food", "restaurant", "cafe", "fuel"];

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";
const RADIUS_M = 1500;

function brandAllowed(t) {
  const candidates = [t.brand, t.name, t.operator]
    .filter(Boolean)
    .map((s) => s.toLowerCase().trim());
  return candidates.some((c) => BRAND_ALLOWLIST.has(c));
}

function buildQuery(lat, lng) {
  const filters = AMENITY_TYPES
    .map((a) => `node["amenity"="${a}"](around:${RADIUS_M},${lat},${lng});`)
    .join("\n");
  return `
    [out:json][timeout:10];
    (
      ${filters}
    );
    out tags 60;
  `.trim();
}

export async function fetchCommonPlaces(lat, lng) {
  try {
    const body = `data=${encodeURIComponent(buildQuery(lat, lng))}`;
    const res = await fetch(OVERPASS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    if (!res.ok) return [];
    const { elements = [] } = await res.json();

    return elements
      .filter((el) => brandAllowed(el.tags || {}))
      .map((el) => {
        const t = el.tags || {};
        const name = t.brand || t.name || "Restroom available";
        // Overpass occasionally returns elements without coords; skip those
        const lat = typeof el.lat === "number" ? el.lat : el.center?.lat;
        const lng = typeof el.lon === "number" ? el.lon : el.center?.lon;
        if (typeof lat !== "number" || typeof lng !== "number") return null;
        return {
          id: `common-${el.type}-${el.id}`,
          source: "inferred",
          name,
          street: [t["addr:housenumber"], t["addr:street"]].filter(Boolean).join(" "),
          city: t["addr:city"],
          state: t["addr:state"],
          country: t["addr:country"],
          latitude: lat,
          longitude: lng,
          accessible: t.wheelchair === "yes",
          unisex: false,
          single_occupant: null,
          family: false,
          fee: false, // customer use, not technically free
          opening_hours: t.opening_hours || null,
          directions: null,
          comment: "Customer bathroom — buy something first",
          inferred: true, // UI flag for softer treatment
          amenity_type: t.amenity,
          upvote: 0,
          downvote: 0,
        };
      })
      .filter(Boolean);
  } catch {
    return [];
  }
}
