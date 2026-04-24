/**
 * Reviews — device-local MVP.
 *
 * This stores reviews in localStorage so users can rate restrooms without
 * making an account. It's single-device and lost on data clear — this is
 * intentional for the MVP (no backend cost, no moderation burden).
 *
 * When you're ready to go cross-device:
 *   - Swap this module's internals for Firestore / Supabase / a small
 *     serverless endpoint. The exported API (getReviews / addReview) is
 *     designed so no component code has to change.
 *
 * Storage shape:
 *   localStorage["restroom_reviews_v1"] = {
 *     [restroomId]: [
 *       { id, rating: 1-5, cleanliness: 1-5, comment, createdAt },
 *       ...
 *     ],
 *     ...
 *   }
 */

const KEY = "restroom_reviews_v1";

function readAll() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) || {} : {};
  } catch {
    return {};
  }
}

function writeAll(obj) {
  try {
    localStorage.setItem(KEY, JSON.stringify(obj));
  } catch {}
}

/** Get all reviews for a given restroom id, newest first. */
export function getReviews(restroomId) {
  const all = readAll();
  return [...(all[restroomId] || [])].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
}

/** Append a review. Returns the created review object. */
export function addReview(restroomId, { rating, cleanliness, comment }) {
  const all = readAll();
  const list = all[restroomId] || [];
  const review = {
    id: `r_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    rating: Number(rating) || 0,
    cleanliness: Number(cleanliness) || 0,
    comment: (comment || "").slice(0, 500), // cap length
    createdAt: new Date().toISOString(),
  };
  all[restroomId] = [review, ...list];
  writeAll(all);
  return review;
}

/** Aggregate stats (avg rating, avg cleanliness, count) for quick display. */
export function getStats(restroomId) {
  const list = getReviews(restroomId);
  if (list.length === 0) {
    return { count: 0, avgRating: null, avgCleanliness: null };
  }
  const sum = (arr, key) => arr.reduce((s, x) => s + (x[key] || 0), 0);
  return {
    count: list.length,
    avgRating: +(sum(list, "rating") / list.length).toFixed(1),
    avgCleanliness: +(sum(list, "cleanliness") / list.length).toFixed(1),
  };
}
