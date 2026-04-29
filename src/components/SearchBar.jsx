import { useState, useRef, useEffect } from "react";
import { geocodeSearch } from "../services/geocoder";
import { trackEvent } from "../utils/analytics";

/**
 * SearchBar — let users plan ahead. Type any address, landmark, or
 * city; we geocode via OSM Nominatim; on select, the app re-centers
 * to that point and re-fetches bathrooms.
 *
 * Use cases:
 *   - "I'm flying to Tokyo tomorrow, what bathrooms are around the
 *     Shibuya station?"
 *   - "Where are the bathrooms near Disneyland?"
 *   - "I'm planning a road trip — bathrooms along the route"
 *
 * Props:
 *   onPick({ lat, lng, displayName }) — fires when user selects a result
 *   onClear()                        — fires when user clicks ✕ to reset
 */
export default function SearchBar({ onPick, onClear }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);
  const containerRef = useRef(null);

  // Debounce search → 1 request per second feels live but respects
  // Nominatim's fair-use rate limit
  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (query.trim().length < 3) {
      setResults([]);
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      const found = await geocodeSearch(query);
      setResults(found);
      setLoading(false);
      setOpen(found.length > 0);
    }, 350);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  // Click outside → close
  useEffect(() => {
    const onClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", onClick);
    return () => document.removeEventListener("pointerdown", onClick);
  }, []);

  const select = (r) => {
    setQuery(r.displayName.split(",").slice(0, 2).join(","));
    setOpen(false);
    trackEvent("place_searched", { query, resultType: r.type });
    onPick({ lat: r.lat, lng: r.lng, displayName: r.displayName });
  };

  const clear = () => {
    setQuery("");
    setResults([]);
    setOpen(false);
    onClear?.();
  };

  return (
    <div className="searchbar" ref={containerRef}>
      <div className="searchbar-input-wrap">
        <span className="searchbar-icon" aria-hidden="true">🔎</span>
        <input
          className="searchbar-input"
          placeholder="Search anywhere — address, landmark, city…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          autoComplete="off"
          aria-label="Search any place"
        />
        {query && (
          <button className="searchbar-clear" onClick={clear} aria-label="Clear">×</button>
        )}
      </div>

      {open && (
        <ul className="searchbar-results" role="listbox">
          {loading && <li className="searchbar-loading">Searching…</li>}
          {!loading && results.length === 0 && query.length >= 3 && (
            <li className="searchbar-empty">No matches.</li>
          )}
          {!loading && results.map((r, i) => (
            <li key={i}>
              <button
                className="searchbar-result"
                onClick={() => select(r)}
                role="option"
              >
                <span className="searchbar-result-name">{r.displayName.split(",")[0]}</span>
                <span className="searchbar-result-rest">
                  {r.displayName.split(",").slice(1).join(",")}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
