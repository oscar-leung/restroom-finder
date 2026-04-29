import { useState, useEffect, useMemo } from "react";
import useGeolocation from "./hooks/useGeolocation";
import useUsagePatterns from "./hooks/useUsagePatterns";
import { fetchNearbyRestrooms } from "./services/restroomApi";
import { distanceMeters } from "./utils/distance";
import IntroScreen from "./components/IntroScreen";
import LoadingGame from "./components/LoadingGame";
import HeroStack from "./components/HeroStack";
import useOnline from "./hooks/useOnline";
import AlternativesRow from "./components/AlternativesRow";
import MapView from "./components/MapView";
import RestroomPanel from "./components/RestroomPanel";
import AddBathroomModal from "./components/AddBathroomModal";
import RecentlyAdded from "./components/RecentlyAdded";
import FilterBar from "./components/FilterBar";
import RouletteButton from "./components/RouletteButton";
import AchievementToast from "./components/AchievementToast";
import VoiceButton from "./components/VoiceButton";
import { getUserBathrooms } from "./services/userBathrooms";
import { recordVisit, getAllVisits } from "./services/visitTracker";
import { getFavorites } from "./services/favorites";
import { tryUnlock } from "./services/achievements";
import { touchStreak, getStreak } from "./services/streak";
import { getTheme, applyTheme, toggleTheme } from "./services/theme";
import { getComfort, setComfort, toggleComfort } from "./services/comfort";
import { getPoints } from "./services/conditionReports";
import { isOpenNow } from "./utils/hours";
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
  // Active filters
  const [filters, setFilters] = useState({
    accessible: false,
    unisex: false,
    free: false,
    openNow: false,
    singleOccupant: false,
  });
  // Achievement toast queue (shows one at a time)
  const [achievement, setAchievement] = useState(null);
  // Intro screen — shown on cold load
  const [introDone, setIntroDone] = useState(false);
  // Streak counter — Duolingo-style daily flame
  const [streak, setStreak] = useState(() => getStreak());
  // Online/offline status
  const isOnline = useOnline();
  // Theme (default | midnight). Apply on mount.
  const [theme, setTheme] = useState(() => getTheme());
  useEffect(() => { applyTheme(theme); }, [theme]);
  // Comfort mode — bigger text, slower walking pace, less visual noise
  const [comfort, setComfortState] = useState(() => getComfort());
  useEffect(() => { setComfort(comfort); }, [comfort]);
  const onToggleComfort = () => {
    const next = toggleComfort();
    setComfortState(next);
    trackEvent("comfort_toggled", { on: next });
  };
  // Points (visible badge in header)
  const [points, setPoints] = useState(() => getPoints());
  // Refresh points when details modal closes (in case condition reports happened)
  useEffect(() => {
    if (!detailsOpen) setPoints(getPoints());
  }, [detailsOpen]);
  const onToggleTheme = () => {
    const next = toggleTheme();
    setTheme(next);
    trackEvent("theme_toggled", { theme: next });
  };

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

  // Merge API + user-added, attach distance, apply filters, sort by distance.
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
      .filter((r) => !filters.accessible || r.accessible)
      .filter((r) => !filters.unisex || r.unisex)
      // Free chip: hide entries we KNOW charge a fee. Unknown stays visible.
      .filter((r) => !filters.free || r.fee !== true)
      // Open-now chip: only show entries we KNOW are open. Unknown hidden when filter active.
      .filter((r) => {
        if (!filters.openNow) return true;
        const { isOpen, knownStatus } = isOpenNow(r.opening_hours);
        return knownStatus && isOpen;
      })
      // Private (single-occupant) chip: only show entries we KNOW are private.
      .filter((r) => !filters.singleOccupant || r.single_occupant === true)
      .sort((a, b) => a.distance - b.distance);
  }, [restrooms, userBathrooms, position, filters]);

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
  const handleNext = () => {
    setHeroIndex((i) => {
      if (i === 0) {
        const ach = tryUnlock("first_swipe");
        if (ach) setAchievement(ach);
      }
      return Math.min(i + 1, sorted.length - 1);
    });
  };
  const handlePrev = () => setHeroIndex((i) => Math.max(i - 1, 0));

  // Roulette: pick a random nearby bathroom (not the closest). Shows
  // it in the hero, fires achievement on first roll.
  const handleRoulette = (winner) => {
    const idx = sorted.findIndex((s) => s.id === winner.id);
    if (idx >= 0) {
      setHeroIndex(idx);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    const ach = tryUnlock("first_roulette");
    if (ach) setAchievement(ach);
  };

  const handleRefresh = () => {
    setHeroIndex(0);
    refreshLocation();
  };

  // Combined GO handler: records pattern + visit + streak; fires GA4 + achievements.
  const handleGo = (restroom) => {
    if (!restroom) return;
    recordUsage();
    const updated = recordVisit(restroom.id);
    setVisits(getAllVisits());
    // Streak: advance the daily flame counter
    const streakResult = touchStreak();
    setStreak({ count: streakResult.count, longest: streakResult.longest, isToday: true });
    trackEvent("bathroom_visited", {
      id: String(restroom.id),
      visit_count: updated?.count || 1,
      distance_m: Math.round(restroom.distance || 0),
      streak_count: streakResult.count,
    });
    // Achievement chains
    const firstGo = tryUnlock("first_go");
    if (firstGo) setAchievement(firstGo);
    if (updated?.count === 3) {
      const three = tryUnlock("three_visits");
      if (three) setAchievement(three);
    }
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
      <div className="status-screen status-screen-game">
        <LoadingGame message="Finding bathrooms near you…" />
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
      {!introDone && <IntroScreen onDone={() => setIntroDone(true)} />}

      {/* Aurora blobs — decorative, pointer-events: none */}
      <div className="aurora" aria-hidden="true"><span /></div>

      <header className="app-header">
        <div className="app-brand">
          <img className="app-icon-img" src={`${import.meta.env.BASE_URL}icon-192.svg`} alt="" width="32" height="32" />
          <h1>
            Gotta Go
            <span className="app-tag" aria-hidden="true">closest bathroom, instantly</span>
          </h1>
        </div>
        <div className="header-right">
          {points.total > 0 && (
            <div
              className="points-badge"
              title={`${points.total} contributor points · ${points.lifetime} lifetime`}
            >
              <span className="points-icon" aria-hidden="true">⚡</span>
              <span className="points-num">{points.total}</span>
            </div>
          )}
          {streak.count > 0 && (
            <div
              className={`streak-flame ${streak.isToday ? "streak-active" : "streak-stale"}`}
              title={`${streak.count}-day streak. Longest: ${streak.longest}`}
              aria-label={`${streak.count}-day streak`}
            >
              <span className="streak-icon" aria-hidden="true">🔥</span>
              <span className="streak-num">{streak.count}</span>
            </div>
          )}
          <button
            className={`theme-toggle ${comfort ? "comfort-on" : ""}`}
            onClick={onToggleComfort}
            title={comfort ? "Comfort mode on (tap to turn off)" : "Comfort mode: bigger text, slower pace"}
            aria-label="Toggle comfort mode"
            aria-pressed={comfort}
          >
            <span style={{ fontSize: "13px", fontWeight: 700 }}>{comfort ? "A−" : "A+"}</span>
          </button>
          <button
            className="theme-toggle"
            onClick={onToggleTheme}
            title={theme === "midnight" ? "Switch to light" : "Switch to dark"}
            aria-label="Toggle dark mode"
          >
            {theme === "midnight" ? "☀" : "☾"}
          </button>
          <button
            className="header-refresh"
            onClick={handleRefresh}
            title="Refresh location"
            aria-label="Refresh location"
          >
            ↻
          </button>
        </div>
      </header>

      {usingFallback && (
        <div className="fallback-banner">
          Showing San Francisco — enable location for your area
        </div>
      )}

      {!isOnline && (
        <div className="offline-banner">
          📡 Offline — showing your last cached bathrooms
        </div>
      )}

      <FilterBar
        filters={filters}
        onChange={setFilters}
        onLocate={handleRefresh}
      />

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

        <HeroStack
          sorted={sorted}
          heroIndex={safeIndex}
          restroom={hero}
          index={safeIndex}
          total={sorted.length}
          visitCount={hero ? visits[hero.id]?.count || 0 : 0}
          onGo={() => handleGo(hero)}
          onDetails={() => setDetailsOpen(hero)}
          onNext={handleNext}
          onPrev={handlePrev}
        />

        <VoiceButton
          onGo={() => {
            if (hero) {
              handleGo(hero);
              const url = `https://www.google.com/maps/dir/?api=1&destination=${hero.latitude},${hero.longitude}&travelmode=walking`;
              window.open(url, "_blank", "noopener,noreferrer");
            }
          }}
          onNext={handleNext}
          onOpenMap={() => setMapOpen(true)}
          onAddBathroom={() => setAddOpen(true)}
          onRoulette={() => sorted.length >= 3 && handleRoulette(sorted[Math.floor(Math.random() * sorted.length)])}
        />

        {sorted.length >= 3 && (
          <RouletteButton candidates={sorted} onPick={handleRoulette} />
        )}

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
        onAchievement={(a) => setAchievement(a)}
      />

      <AchievementToast
        achievement={achievement}
        onDismiss={() => setAchievement(null)}
      />

      {addOpen && (
        <AddBathroomModal
          position={geoPosition}
          onClose={() => setAddOpen(false)}
          onAdded={(entry) => {
            const updated = getUserBathrooms();
            setUserBathrooms(updated);
            setHeroIndex(0);
            // Achievement unlocks
            const first = tryUnlock("first_add");
            if (first) setAchievement(first);
            else if (updated.length >= 5) {
              const five = tryUnlock("five_added");
              if (five) setAchievement(five);
            }
          }}
        />
      )}
    </div>
  );
}

export default App;
