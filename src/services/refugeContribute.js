/**
 * Refuge Restrooms — contribute upstream.
 *
 * When a user adds a bathroom in our app, we can optionally POST it
 * to the Refuge API so it benefits everyone (not just our users).
 * Refuge moderates submissions before they go live.
 *
 * Endpoint: https://www.refugerestrooms.org/api/v1/restrooms
 * Method: POST
 * Schema: name, street, city, state, accessible, unisex, directions,
 *   comment, latitude, longitude, country (optional)
 *
 * Notes:
 * - No API key required for the public submission endpoint
 * - Submissions don't appear in `by_location` immediately — they're
 *   queued for moderation
 * - We pass the user's note as `directions` (the field Refuge uses
 *   to communicate "go inside, ask the cashier" type info)
 *
 * https://www.refugerestrooms.org/api/docs/
 */

const REFUGE_POST = "https://www.refugerestrooms.org/api/v1/restrooms";

export async function contributeToRefuge(entry) {
  const required = ["name", "latitude", "longitude"];
  for (const k of required) {
    if (entry[k] == null) {
      throw new Error(`Missing required field: ${k}`);
    }
  }

  const payload = {
    restroom: {
      name: entry.name,
      street: entry.street || "",
      city: entry.city || "",
      state: entry.state || "",
      country: entry.country || "US",
      accessible: !!entry.accessible,
      unisex: !!entry.unisex,
      directions: entry.directions || entry.comment || "",
      comment: entry.comment || "",
      latitude: Number(entry.latitude),
      longitude: Number(entry.longitude),
    },
  };

  try {
    const res = await fetch(REFUGE_POST, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      // Refuge returns JSON errors but sometimes plain HTML for upstream
      // failures — handle both gracefully.
      let detail = "";
      try {
        const j = await res.json();
        detail = j?.error || JSON.stringify(j).slice(0, 160);
      } catch {
        detail = await res.text().catch(() => "");
      }
      return { ok: false, status: res.status, error: detail };
    }

    const data = await res.json().catch(() => ({}));
    return { ok: true, status: res.status, data };
  } catch (err) {
    return { ok: false, error: err.message || "Network error" };
  }
}
