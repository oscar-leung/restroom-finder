import { useState, useEffect, useMemo } from "react";
import useGeolocation from "./hooks/useGeolocation";
import { fetchNearbyRestrooms } from "./services/restroomApi";
import { distanceMeters } from "./utils/distance";
import MapView from "./components/MapView";
import RestroomPanel from "./components/RestroomPanel";
import RestroomList from "./components/RestroomList";
import FilterBar from "./components/FilterBar";
import "./index.css";

// Fallback location (San Francisco) if geolocation is denied
const DEFAULT_POSITION = { latitude: 37.7749, longitude: -122.4194 };

function App() {
  // 1. Geolocation
  const {
    position: geoPosition,
    error: geoError,
    loading: geoLoading,
    refresh: refreshLocation,
  } = useGeolocation();

  // 2. Final position: real GPS or fallback
  const position = geoPosition || (geoError ? DEFAULT_POSITION : null);
  const usingFallback = !geoPosition && !!geoError;

  // 3. Restrooms state
  const [restrooms, setRestrooms] = useState([]);
  const [apiError, setApiError] = useState(null);
  const [apiLoading, setApiLoading] = useState(false);

  // 4. UI state
  const [selected, setSelected] = useState(null);
  const [filters, setFilters] = useState({ accessible: false, unisex: false });
  const [recenterKey, setRecenterKey] = useState(0);

  // 5. Fetch restrooms when position changes
  useEffect(() => {
    if (!position) return;

    setApiLoading(true);
    setApiError(null);
    fetchNearbyRestrooms(position.latitude, position.longitude)
      .then((data) => {
        setRestrooms(data);
        setApiLoading(false);
      })
      .catch((err) => {
        setApiError(err.message);
        setApiLoading(false);
      });
  }, [position?.latitude, position?.longitude]);

  // 6. Add .distance to each restroom, filter, sort
  const processedRestrooms = useMemo(() => {
    if (!position) return [];

    return restrooms
      .map((r) => ({
        ...r,
        distance: distanceMeters(
          position.latitude,
          position.longitude,
          r.latitude,
          r.longitude
        ),
      }))
      .filter((r) => (filters.accessible ? r.accessible : true))
      .filter((r) => (filters.unisex ? r.unisex : true))
      .sort((a, b) => a.distance - b.distance);
  }, [restrooms, position, filters]);

  // 7. When a restroom is selected, fly map to it
  const handleSelect = (restroom) => {
    setSelected(restroom);
  };

  // 8. "Near me" button — recenter on user
  const handleLocate = () => {
    refreshLocation();
    setRecenterKey((k) => k + 1);
  };

  // --- Loading / error screens ---

  if (geoLoading) {
    return (
      <div className="status-screen">
        <div className="spinner" />
        <p>Finding your location…</p>
      </div>
    );
  }

  if (!position) {
    return (
      <div className="status-screen">
        <div className="spinner" />
        <p>Loading…</p>
      </div>
    );
  }

  if (apiError) {
    return (
      <div className="status-screen">
        <h2>Couldn't load restrooms</h2>
        <p>{apiError}</p>
        <button className="cta-button" onClick={() => window.location.reload()}>
          Try again
        </button>
      </div>
    );
  }

  // --- Main layout ---

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-brand">
          <span className="app-icon" aria-hidden="true">🚻</span>
          <h1>Restroom Finder</h1>
        </div>
      </header>

      {usingFallback && (
        <div className="fallback-banner">
          Showing San Francisco — enable location for your area
        </div>
      )}

      <FilterBar
        filters={filters}
        onChange={setFilters}
        onLocate={handleLocate}
      />

      <div className="map-wrapper">
        {apiLoading && (
          <div className="map-loading">
            <div className="spinner spinner-sm" />
            Searching…
          </div>
        )}
        <MapView
          position={position}
          restrooms={processedRestrooms}
          onSelect={handleSelect}
          selectedId={selected?.id}
          recenterKey={recenterKey}
        />
      </div>

      <RestroomList
        restrooms={processedRestrooms}
        onSelect={handleSelect}
        selectedId={selected?.id}
      />

      <RestroomPanel
        restroom={selected}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}

export default App;
