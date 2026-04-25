import { useState, useEffect, useMemo } from "react";
import useGeolocation from "./hooks/useGeolocation";
import useUsagePatterns from "./hooks/useUsagePatterns";
import { fetchNearbyRestrooms } from "./services/restroomApi";
import { distanceMeters } from "./utils/distance";
import HeroCard from "./components/HeroCard";
import AlternativesRow from "./components/AlternativesRow";
import MapView from "./components/MapView";
import RestroomPanel from "./components/RestroomPanel";
import AddBathroomModal from "./components/AddBathroomModal";
import RecentlyAdded from "./components/RecentlyAdded";
import { getUserBathrooms } from "./services/userBathrooms";
import { recordVisit, getAllVisits } from "./services/visitTracker";
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
  const [userBathrooms, setUserBathrooms] = useState(() => getUserBathrooms());
  const [apiError, setApiError] = useState(null);
  const [apiLoading, setApiLoading] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  // --- UI state ---
  // `heroIndex` is the position in `sorted` currently shown as the hero.
  // 0 = closest, 1 = second closest, etc. Swipe / alternative-click changes it.
  const [heroIndex, setHeroIndex] = useState(0);
  const [detailsOpen, setDetailsOpen] = useState(null);
  const [mapOpen, setMapOpen] = useState(false);
  // Visit map (bathroom_id → {count, lastVisited}). Updated on each GO tap.
  const [visits, setVisits] = useState(() => getAllVisits());

  // --- Usage patterns (privacy-first, localStorage-only) ---
  const { record: recordUsage, hint: usageHint, inTypicalWindow } =
    useUsagePatterns();

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

  // Merge API results + user-added bathrooms, then add .distance + sort
  const sorted = useMemo(() => {
    if (!position) return [];
    const combined = [...restrooms, ...userBathrooms];
    return combined
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
  }, [restrooms, userBathrooms, position]);

  // Clamp heroIndex if the list shrunk
  const safeIndex = Math.min(heroIndex, Math.max(0, sorted.length - 1));
  const hero = sorted[safeIndex] || null;

  // For the alternatives row: everything except the current hero, ordered by distance
  const orderedForAlts = useMemo(() => {
    if (!hero) return sorted;
    return [hero, ...sorted.filter((r) => r.id !== hero.id)];
  }, [sorted, hero]);

  // Promote: used by alternative-card taps and map-pin taps
  const handlePromote = (r) => {
    const idx = sorted.findIndex((s) => s.id === r.id);
    if (idx >= 0) setHeroIndex(idx);
    trackEvent("alternative_promoted", {
      distance_m: Math.round(r.distance || 0),
      from_index: safeIndex,
      to_index: idx,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Swipe → next / previous. Clamp at edges (no wrapping — 1st restroom
  // swipe-right does nothing; feels correct for "closest" anchor).
  const handleNext = () =>
    setHeroIndex((i) => Math.min(i + 1, sorted.length - 1));
  const handlePrev = () => setHeroIndex((i) => Math.max(i - 1, 0));

  const handleRefresh = () => {
    setHeroIndex(0);
    refreshLocation();
  };

  // Combined GO handler: records pattern + per-bathroom visit count, fires GA4
  const handleGo = (restroom) => {
    if (!restroom) return;
    recordUsage();
    const updated = recordVisit(restroom.id);
    setVisits(getAllVisits());
    trackEvent("bathroom_visited", {
      id: String(restroom.id),
      visit_count: updated?.count || 1,
      distance_m: Math.round(restroom.distance || 0),
    });
  };

  // Bucket counts for the header summary ("X within 500m")
  const bucketCounts = useMemo(() => {
    const close = sorted.filter((r) => r.distance <= 500).length;
    const med = sorted.filter((r) => r.distance <= 1000).length;
    return { total: sorted.length, close, med };
  }, [sorted]);

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
      {/* Aurora blobs — decorative, pointer-events: none */}
      <div className="aurora" aria-hidden="true"><span /></div>

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
        {usageHint && (
          <div className={`usage-hint ${inTypicalWindow ? "usage-hint-active" : ""}`}>
            <span aria-hidden="true">🕐</span>
            {usageHint}
            {inTypicalWindow && " — you might want one soon"}
          </div>
        )}

        {/* Visible total + nearby bucket counts (Legal-Walls-style) */}
        <div className="count-summary">
          <span className="count-num">{bucketCounts.total}</span>
          <span className="count-label">nearby</span>
          {bucketCounts.close > 0 && (
            <>
              <span className="count-divider" />
              <span className="count-bucket">
                <strong>{bucketCounts.close}</strong> within 500&thinsp;m
              </span>
            </>
          )}
          {bucketCounts.med > bucketCounts.close && (
            <span className="count-bucket count-bucket-dim">
              <strong>{bucketCounts.med}</strong> within 1&thinsp;km
            </span>
          )}
        </div>

        <HeroCard
          restroom={hero}
          index={safeIndex}
          total={sorted.length}
          visitCount={hero ? visits[hero.id]?.count || 0 : 0}
          onGo={() => handleGo(hero)}
          onDetails={() => setDetailsOpen(hero)}
          onNext={handleNext}
          onPrev={handlePrev}
        />

        <AlternativesRow
          restrooms={orderedForAlts}
          onPromote={handlePromote}
        />

        <RecentlyAdded
          userBathrooms={sorted.filter((r) => r.source === "user")}
          onSelect={handlePromote}
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

        <button
          className="add-bathroom-btn"
          onClick={() => {
            setAddOpen(true);
            trackEvent("add_bathroom_opened");
          }}
          disabled={!geoPosition}
          title={!geoPosition ? "Enable location to add a bathroom" : "Add a bathroom at your current location"}
        >
          <span className="plus" aria-hidden="true">+</span>
          Add a bathroom here
        </button>

        <a
          className="tip-jar"
          href="https://buymeacoffee.com/holymushy"
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
            visits={visits}
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
        visitRecord={detailsOpen ? visits[detailsOpen.id] : null}
        onClose={() => setDetailsOpen(null)}
      />

      {addOpen && (
        <AddBathroomModal
          position={geoPosition}
          onClose={() => setAddOpen(false)}
          onAdded={(entry) => {
            setUserBathrooms(getUserBathrooms());
            // Promote it to the hero so the user immediately sees their addition
            setHeroIndex(0);
          }}
        />
      )}
    </div>
  );
}

export default App;
