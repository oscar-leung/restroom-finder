import { useState } from "react";
import { formatDistance } from "../utils/distance";

/**
 * RestroomList — a bottom sheet (mobile) / side drawer (desktop) showing
 * a scrollable list of restrooms sorted by distance.
 *
 * Features:
 *   - Tap the handle/header to expand/collapse (mobile)
 *   - Tap a row to select the restroom (centers map & opens details)
 *   - Shows distance, accessibility badges, upvote/downvote score
 *
 * Props:
 *   restrooms   – array (already sorted by distance, with .distance added)
 *   onSelect    – callback when a row is tapped
 *   selectedId  – id of currently selected restroom (for highlight)
 */
export default function RestroomList({ restrooms, onSelect, selectedId }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`sheet ${expanded ? "sheet-expanded" : ""}`}>
      {/* Drag handle — tap to expand/collapse on mobile */}
      <button className="sheet-handle" onClick={() => setExpanded(!expanded)}>
        <div className="sheet-grip" />
        <div className="sheet-title">
          <strong>{restrooms.length}</strong> restroom
          {restrooms.length !== 1 && "s"} nearby
        </div>
      </button>

      {/* Scrollable list */}
      <div className="sheet-list">
        {restrooms.length === 0 && (
          <div className="sheet-empty">
            No restrooms match the current filters.
          </div>
        )}

        {restrooms.map((r) => {
          const score = (r.upvote || 0) - (r.downvote || 0);
          const address = [r.street, r.city].filter(Boolean).join(", ");
          const isSelected = r.id === selectedId;

          return (
            <button
              key={r.id}
              className={`row ${isSelected ? "row-selected" : ""}`}
              onClick={() => onSelect(r)}
            >
              <div className="row-main">
                <div className="row-name">{r.name || "Unnamed restroom"}</div>
                {address && <div className="row-address">{address}</div>}
                <div className="row-badges">
                  {r.accessible && (
                    <span className="mini-badge mini-accessible">♿</span>
                  )}
                  {r.unisex && (
                    <span className="mini-badge mini-unisex">⚧</span>
                  )}
                  {score !== 0 && (
                    <span
                      className={`mini-badge ${
                        score > 0 ? "mini-positive" : "mini-negative"
                      }`}
                    >
                      {score > 0 ? "👍" : "👎"} {Math.abs(score)}
                    </span>
                  )}
                </div>
              </div>
              <div className="row-distance">
                {r.distance != null && formatDistance(r.distance)}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
