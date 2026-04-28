/**
 * Google Places (New) — high-quality bathroom data with names, hours,
 * photos, and ratings.
 *
 * COSTS REAL MONEY. Pricing as of 2026:
 *   - Nearby Search (Basic): $32 per 1k requests; $200/mo free credit
 *   - Place Details with photos: $17 per 1k
 * For a bathroom finder, expect ~1 search per session. At 10k sessions/month
 * you're at ~$320/mo (covered by free credit if you stay under).
 *
 * Setup:
 *   1. Get a key at https://console.cloud.google.com/google/maps-apis
 *   2. Restrict it to "Places API (New)" + your domain
 *      (oscar-leung.github.io and capacitor://localhost for the native shell)
 *   3. Add as repo secret VITE_GOOGLE_MAPS_KEY
 *   4. The deploy workflow already forwards env-prefixed VITE_ vars.
 *      The same secret-set flow we used for VITE_GA_ID applies.
 *
 * Without a key set, this module returns an empty array (no errors,
 * no requests, zero cost).
 */

const KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY;
const ENDPOINT = "https://places.googleapis.com/v1/places:searchNearby";

export async function fetchGooglePlaces(lat, lng) {
  if (!KEY) return [];

  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": KEY,
        // Field mask: only what we use → keeps cost in the cheap "Basic" tier
        "X-Goog-FieldMask": [
          "places.id",
          "places.displayName",
          "places.formattedAddress",
          "places.location",
          "places.rating",
          "places.userRatingCount",
          "places.regularOpeningHours",
          "places.accessibilityOptions",
        ].join(","),
      },
      body: JSON.stringify({
        includedTypes: ["public_bathroom"],
        maxResultCount: 20,
        locationRestriction: {
          circle: {
            center: { latitude: lat, longitude: lng },
            radius: 2000.0,
          },
        },
      }),
    });

    if (!res.ok) {
      console.warn(`Google Places: ${res.status}`);
      return [];
    }

    const data = await res.json();
    const places = data.places || [];

    return places.map((p) => ({
      id: `google-${p.id}`,
      source: "google",
      name: p.displayName?.text || "Public Restroom",
      street: p.formattedAddress || "",
      city: "",
      state: "",
      country: "",
      latitude: Number(p.location?.latitude),
      longitude: Number(p.location?.longitude),
      accessible: !!p.accessibilityOptions?.wheelchairAccessibleEntrance,
      unisex: false,
      fee: null,
      // Google's regularOpeningHours is structured; we'd flatten to an
      // OSM-style string here if we wanted to feed it through hours.js.
      opening_hours: p.regularOpeningHours?.weekdayDescriptions?.join(";") || null,
      directions: null,
      comment: p.userRatingCount ? `Google rating: ${p.rating} (${p.userRatingCount})` : null,
      upvote: Math.round((p.rating || 0) * 10), // approximate score for our merge
      downvote: 0,
    }));
  } catch (err) {
    console.warn("Google Places error", err);
    return [];
  }
}
