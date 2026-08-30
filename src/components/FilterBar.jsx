import { trackEvent } from "../utils/analytics";

/**
 * FilterBar — horizontal row of toggle chips.
 *
 * Props:
 *   filters        – { accessible, unisex, free, openNow, ... country }
 *   onChange       – callback receiving updated filters object
 *   onLocate       – callback for the "Near me" button (re-request location)
 *   countryOptions – distinct countries in the loaded results; the
 *                    dropdown renders only when there are 2+ (behind
 *                    the country_filter flag — pass undefined when off)
 */
export default function FilterBar({ filters, onChange, onLocate, countryOptions }) {
  const toggle = (key) => {
    const next = { ...filters, [key]: !filters[key] };
    trackEvent("filter_toggled", { filter: key, on: next[key] });
    onChange(next);
  };

  const pickCountry = (value) => {
    trackEvent("filter_toggled", { filter: "country", on: !!value, country: value });
    onChange({ ...filters, country: value });
  };

  return (
    <div className="filter-bar">
      <button
        className={`chip ${filters.accessible ? "chip-active" : ""}`}
        onClick={() => toggle("accessible")}
        aria-pressed={!!filters.accessible}
      >
        <span className="chip-icon" aria-hidden="true">♿</span>
        Accessible
      </button>

      <button
        className={`chip ${filters.unisex ? "chip-active" : ""}`}
        onClick={() => toggle("unisex")}
        aria-pressed={!!filters.unisex}
      >
        <span className="chip-icon" aria-hidden="true">⚧</span>
        Gender Neutral
      </button>

      <button
        className={`chip ${filters.free ? "chip-active" : ""}`}
        onClick={() => toggle("free")}
        aria-pressed={!!filters.free}
        title="Hide bathrooms that charge a fee"
      >
        <span className="chip-icon" aria-hidden="true">✓</span>
        Free
      </button>

      <button
        className={`chip ${filters.openNow ? "chip-active" : ""}`}
        onClick={() => toggle("openNow")}
        aria-pressed={!!filters.openNow}
        title="Only show bathrooms open right now"
      >
        <span className="chip-icon" aria-hidden="true">🕐</span>
        Open now
      </button>

      <button
        className={`chip ${filters.singleOccupant ? "chip-active" : ""}`}
        onClick={() => toggle("singleOccupant")}
        aria-pressed={!!filters.singleOccupant}
        title="Locked single-person bathrooms only"
      >
        <span className="chip-icon" aria-hidden="true">🔒</span>
        Private
      </button>

      <button
        className={`chip ${filters.bench ? "chip-active" : ""}`}
        onClick={() => toggle("bench")}
        aria-pressed={!!filters.bench}
        title="Only show bathrooms with a bench within 60m — somewhere to rest on the way"
      >
        <span className="chip-icon" aria-hidden="true">🪑</span>
        Bench nearby
      </button>

      <button
        className={`chip ${filters.noStairs ? "chip-active" : ""}`}
        onClick={() => toggle("noStairs")}
        aria-pressed={!!filters.noStairs}
        title="Hide bathrooms known to be on another floor or underground"
      >
        <span className="chip-icon" aria-hidden="true">🚷</span>
        No stairs
      </button>

      {countryOptions && countryOptions.length >= 2 && (
        <select
          className={`chip chip-select ${filters.country ? "chip-active" : ""}`}
          value={filters.country || ""}
          onChange={(e) => pickCountry(e.target.value)}
          aria-label="Filter by country"
        >
          <option value="">🌍 All countries</option>
          {countryOptions.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      )}

      <button className="chip chip-locate" onClick={onLocate} title="Recenter on my location">
        <span className="chip-icon" aria-hidden="true">📍</span>
        Near me
      </button>
    </div>
  );
}
