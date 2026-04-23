import { useState, useEffect, useMemo } from "react";
import useGeolocation from "./hooks/useGeolocation";
import { fetchNearbyRestrooms } from "./services/restroomApi";
import { distanceMeters } from "./utils/distance";
import HeroCard from "./components/HeroCard";
import AlternativesRow from "./components/AlternativesRow";
import MapView from "./components/MapView";
import RestroomPanel from "./components/RestroomPanel";
import { trackEvent } from "./utils/analytics";
import "./index.css";

// Fallback if geolocation denied (San Francisco)
const DEFAULT_POSITION = { latitude: 37.7749, longitude: -122.4194 };

function App() {
  // --- Location ---
  const {
    position: geoPosition,
    error: geoError,
    loading: geoLoading,
    refresh: refreshLocation,
  } = useGeolocation();

  const position = geoPosition || (geoError ? DEFAULT_POSITION : null);
  const usingFallback = !geoPosition && !!geoError;

  // --- Restrooms ---
  const [restrooms, setRestrooms] = useState([]);
  const [apiError, setApiError] = useState(null);
  const [apiLoading, setApiLoading] = useState(false);

  // --- UI state ---
  const [manualChoice, setManualChoice] = useState(null); // user-promoted alternative
  const [detailsOpen, setDetailsOpen] = useState(null);
  const [mapOpen, setMapOpen] = useState(false);

  // Fetch when position resolves
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

  // Add .distance + sort by closest
  const sorted = useMemo(() => {
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
      .sort((a, b) => a.distance - b.distance);
  }, [restrooms, position]);

  // The "hero" restroom is either the closest, OR the one the user promoted
  const hero = useMemo(() => {
    if (manualChoice) {
      // Re-find the manual choice in sorted (to get fresh distance)
      const updated = sorted.find((r) => r.id === manualChoice.id);
      return updated || manualChoice;
    }
    return sorted[0] || null;
  }, [sorted, manualChoice]);

  // For alternatives row, put hero first (so AlternativesRow can .slice(1))
  const orderedForAlts = useMemo(() => {
    if (!hero) return sorted;
    return [hero, ...sorted.filter((r) => r.id !== hero.id)];
  }, [sorted, hero]);

  const handlePromote = (r) => {
    setManualChoice(r);
    trackEvent("alternative_promoted", {
      distance_m: Math.round(r.distance || 0),
    });
    // Auto-scroll back to top so user sees the new hero
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleRefresh = () => {
    setManualChoice(null);
    refreshLocation();
  };

  // --- Loading / empty states ---

  if (geoLoading && !position) {
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

  if (apiLoading && sorted.length === 0) {
    return (
      <div className="status-screen">
        <div className="spinner" />
        <p>Finding restrooms near you…</p>
      </div>
    );
  }

  if (sorted.length === 0) {
    return (
      <div className="status-screen">
        <h2>No restrooms found nearby</h2>
        <p>Try refreshing your location.</p>
        <button className="cta-button" onClick={handleRefresh}>
          Refresh
        </button>
      </div>
    );
  }

  // --- Main: hero-first layout ---

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-brand">
          <span className="app-icon" aria-hidden="true">🚻</span>
          <h1>Restroom Finder</h1>
        </div>
        <button
          className="header-refresh"
          onClick={handleRefresh}
          title="Refresh location"
          aria-label="Refresh location"
        >
          ↻
        </button>
      </header>

      {usingFallback && (
        <div className="fallback-banner">
          Showing San Francisco — enable location for your area
        </div>
      )}

      <main className="scroll-area">
        <HeroCard
          restroom={hero}
          onDetails={() => setDetailsOpen(hero)}
        />

        <AlternativesRow
          restrooms={orderedForAlts}
          onPromote={handlePromote}
        />

        <button
          className="map-toggle"
          onClick={() => {
            setMapOpen(true);
            trackEvent("map_opened", { restroom_count: sorted.length });
          }}
        >
          🗺️  View all {sorted.length} on map
        </button>

        <a
          className="tip-jar"
          href="https://buymeacoffee.com/oscarleung"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackEvent("tip_clicked")}
        >
          ☕ Tip the dev
        </a>

        <p className="footer-note">
          Data from{" "}
          <a
            href="https://www.refugerestrooms.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Refuge Restrooms
          </a>
        </p>
      </main>

      {/* Fullscreen map overlay */}
      {mapOpen && (
        <div className="map-overlay">
          <button
            className="map-overlay-close"
            onClick={() => setMapOpen(false)}
            aria-label="Close map"
          >
            ×
          </button>
          <MapView
            position={position}
            restrooms={sorted}
            onSelect={(r) => {
              handlePromote(r);
              setMapOpen(false);
            }}
            selectedId={hero?.id}
            recenterKey={0}
          />
        </div>
      )}

      <RestroomPanel
        restroom={detailsOpen}
        onClose={() => setDetailsOpen(null)}
      />
    </div>
  );
}

export default App;
