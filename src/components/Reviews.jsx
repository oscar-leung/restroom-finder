import { useState, useEffect } from "react";
import { getReviews, addReview, getStats } from "../services/reviews";
import { trackEvent } from "../utils/analytics";

/**
 * Reviews — shown inside the details modal.
 *
 * Simple "stars out of 5" for overall + cleanliness, plus free-text.
 * No auth required. Stored locally (see services/reviews.js).
 */
export default function Reviews({ restroomId }) {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ count: 0, avgRating: null, avgCleanliness: null });
  const [adding, setAdding] = useState(false);
  const [rating, setRating] = useState(5);
  const [cleanliness, setCleanliness] = useState(5);
  const [comment, setComment] = useState("");

  useEffect(() => {
    setReviews(getReviews(restroomId));
    setStats(getStats(restroomId));
  }, [restroomId]);

  const submit = (e) => {
    e.preventDefault();
    addReview(restroomId, { rating, cleanliness, comment });
    trackEvent("review_submitted", { rating, cleanliness });
    // refresh
    setReviews(getReviews(restroomId));
    setStats(getStats(restroomId));
    setComment("");
    setAdding(false);
  };

  return (
    <section className="reviews">
      <div className="reviews-header">
        <h3>Reviews</h3>
        {stats.count > 0 && (
          <div className="reviews-summary">
            ⭐ {stats.avgRating} · 🧼 {stats.avgCleanliness} · {stats.count}{" "}
            review{stats.count !== 1 ? "s" : ""}
          </div>
        )}
      </div>

      {!adding && (
        <button className="review-add-btn" onClick={() => setAdding(true)}>
          + Write a review
        </button>
      )}

      {adding && (
        <form className="review-form" onSubmit={submit}>
          <label>
            Overall
            <StarInput value={rating} onChange={setRating} />
          </label>
          <label>
            Cleanliness
            <StarInput value={cleanliness} onChange={setCleanliness} />
          </label>
          <textarea
            className="review-comment"
            placeholder="Anything useful for the next person? (optional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={500}
            rows={3}
          />
          <div className="review-actions">
            <button type="button" onClick={() => setAdding(false)} className="btn-ghost">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Post
            </button>
          </div>
        </form>
      )}

      <ul className="review-list">
        {reviews.length === 0 && !adding && (
          <li className="review-empty">No reviews yet — be the first.</li>
        )}
        {reviews.map((r) => (
          <li key={r.id} className="review-item">
            <div className="review-stars">
              ⭐ {r.rating} · 🧼 {r.cleanliness}
            </div>
            {r.comment && <p className="review-text">{r.comment}</p>}
            <div className="review-date">
              {new Date(r.createdAt).toLocaleDateString()}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function StarInput({ value, onChange }) {
  return (
    <div className="star-input">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          type="button"
          key={n}
          className={`star ${n <= value ? "star-filled" : ""}`}
          onClick={() => onChange(n)}
          aria-label={`${n} star${n > 1 ? "s" : ""}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}
