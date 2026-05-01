/**
 * Common Places — businesses and venues that reliably have
 * customer-accessible bathrooms even if not formally tagged with
 * `amenity=toilets`.
 *
 * Per Reddit / Google research, these categories are the safest bets:
 *   • Fast food (esp. major US/global chains — public bathrooms expected)
 *   • Coffee chains (Starbucks publicly opened bathrooms in 2018)
 *   • Gas stations on highways (24/7 availability)
 *   • Big-box retail (Costco, Target, Walmart all have customer restrooms)
 *   • Hotels (lobby bathrooms — usually accessible without being a guest)
 *   • Malls (always have public restroom corridors)
 *   • Public libraries (free public restrooms — no purchase required)
 *   • Universities (open library / student-union bathrooms)
 *   • Community centers, gyms (member or day-pass)
 *
 * Each is tagged source="inferred" so the UI can render with a softer
 * "buy something first" or "lobby" treatment.
 *
 * Brand allow-list is deliberately conservative for fast food / coffee /
 * gas because false positives are worse than missing entries. For
 * hotels / malls / libraries we trust the OSM tag itself (fewer fake
 * "hotels" in OSM than fake "restaurants").
 */

// Quoted brand names — all-lowercase comparison; we normalize before matching.
const BRAND_ALLOWLIST = new Set([
  // ===== Fast food (universal US + global) =====
  "mcdonald's", "mcdonalds",
  "burger king", "bk",
  "wendy's", "wendys",
  "taco bell",
  "kfc", "kentucky fried chicken",
  "subway",
  "chipotle", "chipotle mexican grill",
  "panera bread", "panera",
  "in-n-out burger", "in-n-out",
  "shake shack",
  "five guys",
  "popeyes", "popeye's",
  "chick-fil-a", "chick fil a",
  "white castle",
  "jack in the box",
  "carl's jr.", "carls jr",
  "hardee's", "hardees",
  "arby's", "arbys",
  "jersey mike's", "jersey mikes",
  "jimmy john's", "jimmy johns",
  "qdoba", "moe's southwest grill", "moes southwest grill",
  "el pollo loco",
  "del taco",
  "raising cane's", "raising canes",
  "checkers", "rally's", "rallys",
  "sonic", "sonic drive-in",
  "long john silver's", "long john silvers",
  "captain d's", "captain ds",
  "dairy queen", "dq",
  "culver's", "culvers",
  "boston market",
  "noodles & company", "noodles and company",
  "pizza hut",
  "domino's", "dominos",
  "papa john's", "papa johns",
  "little caesars",
  "cici's pizza", "cicis pizza",
  "round table pizza",
  "ihop",
  "denny's", "dennys",
  "waffle house",
  "cracker barrel",
  "applebee's", "applebees",
  "olive garden",
  "outback steakhouse",
  "red lobster",
  "buffalo wild wings",
  "tgi friday's", "tgi fridays",
  "chili's", "chilis",
  "cheesecake factory", "the cheesecake factory",
  "red robin",
  "panda express",
  "p.f. chang's", "pf changs",

  // ===== Coffee =====
  "starbucks",
  "dunkin'", "dunkin", "dunkin' donuts",
  "tim hortons",
  "peet's coffee", "peets coffee",
  "caribou coffee",
  "philz coffee",
  "blue bottle", "blue bottle coffee",
  "the coffee bean & tea leaf", "coffee bean & tea leaf",
  "tully's coffee", "tullys coffee",

  // ===== Gas / convenience (highway 24/7) =====
  "shell",
  "bp",
  "chevron",
  "exxon", "exxonmobil", "mobil",
  "76",
  "arco",
  "sunoco",
  "valero",
  "marathon",
  "phillips 66", "phillips66", "p66",
  "conoco",
  "citgo",
  "circle k",
  "7-eleven", "7eleven", "seven-eleven",
  "wawa",
  "sheetz",
  "buc-ee's", "bucees",
  "kwik trip", "kwiktrip",
  "casey's general store", "casey's", "caseys",
  "quiktrip", "quik trip", "qt",
  "racetrac", "race trac",
  "speedway",
  "love's travel stops", "loves travel stops", "love's",
  "ta travel center", "travelcenters of america",
  "pilot flying j", "pilot", "flying j",

  // ===== Big-box retail =====
  "costco", "costco wholesale",
  "sam's club", "sams club",
  "bj's wholesale", "bjs wholesale",
  "target",
  "walmart", "walmart supercenter",
  "ikea",
  "home depot", "the home depot",
  "lowe's", "lowes", "lowe's home improvement",
  "best buy",
  "menards",
  "academy sports + outdoors", "academy",
  "rei", "rei co-op",
  "dick's sporting goods", "dicks sporting goods",
  "bass pro shops", "bass pro",
  "cabela's", "cabelas",
  "barnes & noble", "barnes and noble",
  "trader joe's", "trader joes",
  "whole foods", "whole foods market",
  "kroger",
  "publix",
  "safeway",
  "albertsons",
  "wegmans",
  "h-e-b", "heb",
  "winco foods", "winco",
  "kohl's", "kohls",
  "macy's", "macys",
  "nordstrom",
  "jcpenney", "jc penney",
  "marshalls",
  "tj maxx", "tjmaxx",
  "ross", "ross dress for less",
  "burlington",
  "nordstrom rack",

  // ===== International / Europe =====
  "pret a manger", "pret",
  "costa coffee", "costa",
  "nero", "caffè nero", "caffe nero",
  "greggs",
  "mcdonald's uk",
  "wetherspoons", "j d wetherspoon",
  "tim hortons canada",
  "boots",  // UK pharmacy with public toilets in larger stores
  "marks & spencer", "m&s",
  "tesco", "tesco extra", "tesco superstore",
  "sainsbury's", "sainsburys",
  "asda",
  "carrefour",
  "auchan",
  "lidl", "aldi",
  "edeka", "rewe",
  "monoprix",

  // ===== Asia-Pacific (light coverage) =====
  "lawson",
  "familymart", "family mart",
  "7-eleven japan",
  "mos burger",
  "ministop",
  "sunkus",
]);

// Tier of OSM tags we query. We treat each tier with a different
// "comment" / fallback name for clearer UX:
//   • food/coffee/gas → "Customer bathroom — buy something first"
//   • hotel           → "Hotel lobby — bathrooms usually accessible"
//   • mall/library/community → "Public restroom available"
//   • university/college/school → "Open during business hours"
const QUERY_TIERS = [
  // Food / coffee / fuel — restricted to brand allow-list to avoid false positives
  { tagKey: "amenity", tagValues: ["fast_food", "restaurant", "cafe", "fuel"], requireBrand: true,
    comment: "Customer bathroom — buy something first", note: "Customer bathroom" },

  // Hotels — trust the OSM tag itself; lobby bathrooms are nearly universal
  { tagKey: "tourism", tagValues: ["hotel", "motel", "hostel"], requireBrand: false,
    comment: "Hotel lobby — bathrooms usually accessible", note: "Hotel" },

  // Malls + department stores — always have public restroom corridors
  { tagKey: "shop",    tagValues: ["mall", "department_store"], requireBrand: false,
    comment: "Public restroom corridor", note: "Mall" },

  // Public services — libraries, community centers, civic
  { tagKey: "amenity", tagValues: ["library", "community_centre", "townhall", "courthouse"], requireBrand: false,
    comment: "Public building — restrooms during open hours", note: "Public building" },

  // Education
  { tagKey: "amenity", tagValues: ["university", "college"], requireBrand: false,
    comment: "Campus — student union / library bathrooms", note: "Campus" },

  // Recreation
  { tagKey: "leisure", tagValues: ["fitness_centre", "sports_centre"], requireBrand: false,
    comment: "Gym / sports center — member or day-pass", note: "Gym" },
];

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";
const RADIUS_M = 1500;

function brandAllowed(t) {
  const candidates = [t.brand, t.name, t.operator]
    .filter(Boolean)
    .map((s) => s.toLowerCase().trim());
  return candidates.some((c) => BRAND_ALLOWLIST.has(c));
}

function buildQuery(lat, lng) {
  // One big union query covering every tier. We let Overpass do the
  // filtering server-side and pull all in a single round trip.
  const filters = QUERY_TIERS.flatMap((tier) =>
    tier.tagValues.map(
      (v) => `node["${tier.tagKey}"="${v}"](around:${RADIUS_M},${lat},${lng});`
    )
  ).join("\n");
  return `
    [out:json][timeout:12];
    (
      ${filters}
    );
    out tags 200;
  `.trim();
}

function findTier(t) {
  for (const tier of QUERY_TIERS) {
    if (tier.tagValues.includes(t[tier.tagKey])) return tier;
  }
  return null;
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
      .map((el) => {
        const t = el.tags || {};
        const tier = findTier(t);
        if (!tier) return null;

        // Brand gate only for the food/coffee/fuel tier
        if (tier.requireBrand && !brandAllowed(t)) return null;

        const lat2 = typeof el.lat === "number" ? el.lat : el.center?.lat;
        const lng2 = typeof el.lon === "number" ? el.lon : el.center?.lon;
        if (typeof lat2 !== "number" || typeof lng2 !== "number") return null;

        const name =
          t.brand || t.name || t.operator || `${tier.note} nearby`;

        return {
          id: `common-${el.type}-${el.id}`,
          source: "inferred",
          name,
          street: [t["addr:housenumber"], t["addr:street"]].filter(Boolean).join(" "),
          city: t["addr:city"],
          state: t["addr:state"],
          country: t["addr:country"],
          latitude: lat2,
          longitude: lng2,
          accessible: t.wheelchair === "yes",
          unisex: false,
          single_occupant: null,
          family: false,
          fee: false,
          opening_hours: t.opening_hours || null,
          directions: null,
          comment: tier.comment,
          inferred: true,
          inferred_kind: tier.note, // "Hotel" / "Mall" / "Customer bathroom" / etc.
          amenity_type: t[tier.tagKey],
          upvote: 0,
          downvote: 0,
        };
      })
      .filter(Boolean);
  } catch {
    return [];
  }
}
