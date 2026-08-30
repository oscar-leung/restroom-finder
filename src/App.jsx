import { useState, useEffect, useMemo } from "react";
import useGeolocation from "./hooks/useGeolocation";
import useUsagePatterns from "./hooks/useUsagePatterns";
import { fetchNearbyRestrooms } from "./services/restroomApi";
import { distanceMeters } from "./utils/distance";
import IntroScreen from "./components/IntroScreen";
import LoadingGame from "./components/LoadingGame";
import HeroStack from "./components/HeroStack";
import SimpleHero from "./components/SimpleHero";
import SearchBar from "./components/SearchBar";
import CelebrationOverlay from "./components/CelebrationOverlay";
import PersonaPicker from "./components/PersonaPicker";
import useOnline from "./hooks/useOnline";
import useInstallPrompt from "./hooks/useInstallPrompt";
import InstallPrompt from "./components/InstallPrompt";
import {
  getPersona,
  hasPickedPersona,
  setPersona as savePersona,
  getPersonaFilterDefaults,
  showsGamification,
} from "./services/persona";
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
import { tryUnlock } from "./services/achievements";
import { touchStreak, getStreak } from "./services/streak";
import { getTheme, applyTheme, toggleTheme } from "./services/theme";
import { getComfort, setComfort, toggleComfort } from "./services/comfort";
import { getPoints, isSuppressed, getSuppressedCount, clearSuppressed } from "./services/conditionReports";
import { isOpenNow } from "./utils/hours";
import { formatDistance } from "./utils/distance";
import { trackEvent } from "./utils/analytics";
import { isFlagOn } from "./utils/featureFlags";
import { normalizeCountry } from "./utils/country";
import { useI18n, LOCALES } from "./i18n";
import "./index.css";

// Fallback if geolocation denied (San Francisco)
const DEFAULT_POSITION = { latitude: 37.7749, longitude: -122.4194 };

function App() {
  // i18n — locale-aware strings everywhere below
  const { t, locale, setLocale } = useI18n();

  // --- Location ---
  const {
    position: geoPosition,
    error: geoError,
    loading: geoLoading,
    refresh: refreshLocation,
  } = useGeolocation();

  // Searched location override — declared first so it's available to
  // the `position` computation below. Set by the SearchBar component.
  const [searchedLocation, setSearchedLocation] = useState(null);

  // Effective position: searched > GPS > fallback.
  const realPosition = geoPosition || (geoError ? DEFAULT_POSITION : null);
  const position = searchedLocation || realPosition;
  const usingFallback = !geoPosition && !!geoError && !searchedLocation;
  const usingSearchedLocation = !!searchedLocation;

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
  // Persona — student / senior / default. Picked once on first visit.
  // Drives sensible defaults for filters + gamification visibility.
  const [persona, setPersonaState] = useState(() => getPersona());
  const [personaPickerOpen, setPersonaPickerOpen] = useState(() => !hasPickedPersona());

  // Active filters — initialized from persona defaults
  const [filters, setFilters] = useState(() => ({
    accessible: false,
    unisex: false,
    free: false,
    openNow: false,
    singleOccupant: false,
    bench: false,
    noStairs: false,
    country: "",
    ...getPersonaFilterDefaults(getPersona()),
  }));
  // Achievement toast queue (shows one at a time)
  const [achievement, setAchievement] = useState(null);
  // Celebration overlay (fires after GO)
  const [celebration, setCelebration] = useState(null);
  // Intro screen — shown on cold load
  const [introDone, setIntroDone] = useState(false);
  // Streak counter — Duolingo-style daily flame
  const [streak, setStreak] = useState(() => getStreak());
  // Online/offline status
  const isOnline = useOnline();
  // PWA install nudge — appears from the 2nd distinct-day visit
  const installPrompt = useInstallPrompt();
  // Apply persona attribute on mount + on change
  useEffect(() => {
    document.documentElement.setAttribute("data-persona", persona);
  }, [persona]);
  // Handler for the picker
  const onPersonaPick = (p) => {
    savePersona(p);
    setPersonaState(p);
    // Merge persona-implied filter defaults onto current filters
    setFilters((f) => ({ ...f, ...getPersonaFilterDefaults(p) }));
    setPersonaPickerOpen(false);
  };
  const gamificationOn = showsGamification(persona);

  // Simple Mode — radically minimal hero. Default ON for new users
  // per Oscar's product direction. Persists per device.
  const [simpleMode, setSimpleMode] = useState(() => {
    try {
      const v = localStorage.getItem("gg_simple_mode_v1");
      // Default to ON for new users (no value yet)
      return v === null ? true : v === "true";
    } catch { return true; }
  });
  const toggleSimpleMode = () => {
    const next = !simpleMode;
    setSimpleMode(next);
    try { localStorage.setItem("gg_simple_mode_v1", String(next)); } catch {}
    trackEvent("simple_mode_toggled", { on: next });
  };
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
  // "Doesn't exist" suppressions can change while the details modal is
  // open — bump this to re-filter the list after it closes.
  const [suppressedTick, setSuppressedTick] = useState(0);
  // Refresh points + suppressions when details modal closes (in case
  // condition reports happened inside it)
  useEffect(() => {
    if (!detailsOpen) {
      setPoints(getPoints());
      setSuppressedTick((t) => t + 1);
    }
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
    void suppressedTick; // re-filter after "doesn't exist" reports
    const combined = [...restrooms, ...userBathrooms];
    return combined
      .filter((r) => !isSuppressed(r.id))
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
      // Bench chip: only entries with a bench within resting range (OSM data).
      .filter((r) => !filters.bench || r.near_bench === true)
      // No-stairs chip: lenient like Free — hide entries we KNOW are on
      // another floor or underground; unknown stays visible.
      .filter((r) => !filters.noStairs || r.ground_floor !== false)
      // Country dropdown (flag-gated): match normalized country codes.
      .filter(
        (r) => !filters.country || normalizeCountry(r.country) === filters.country
      )
      .sort((a, b) => a.distance - b.distance);
  }, [restrooms, userBathrooms, position, filters, suppressedTick]);

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
  // Also pops the Strava-style celebration overlay.
  const handleGo = (restroom) => {
    if (!restroom) return;
    recordUsage();
    const updated = recordVisit(restroom.id);
    setVisits(getAllVisits());
    // Streak: advance the daily flame counter
    const streakResult = touchStreak();
    setStreak({ count: streakResult.count, longest: streakResult.longest, isToday: true });
    // Award points (small reward for using the app for its purpose)
    const pointsForGO = 2;
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
    // Celebration popup — only when the streak advanced (avoids spam
    // when a user re-taps GO multiple times within seconds)
    if (streakResult.advanced || streakResult.reset) {
      setCelebration({
        bathroomName: restroom.name,
        pointsEarned: pointsForGO,
        streakCount: streakResult.count,
      });
    }
  };

  // Country filter (P2 #15, behind the country_filter flag): the
  // dropdown only appears when the loaded results span 2+ countries —
  // border towns, or travelers planning ahead via search.
  const countryOptions = useMemo(() => {
    if (!isFlagOn("country_filter")) return undefined;
    const set = new Set();
    for (const r of [...restrooms, ...userBathrooms]) {
      const c = normalizeCountry(r.country);
      if (c) set.add(c);
    }
    return Array.from(set).sort();
  }, [restrooms, userBathrooms]);

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
        <p>{t("status.finding")}</p>
      </div>
    );
  }

  if (!position) {
    return (
      <div className="status-screen">
        <div className="spinner" />
        <p>{t("status.loading")}</p>
      </div>
    );
  }

  if (apiError) {
    return (
      <div className="status-screen">
        <h2>{t("status.loadFail")}</h2>
        <p>{apiError}</p>
        <button className="cta-button" onClick={() => window.location.reload()}>
          {t("status.tryAgain")}
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
        <h2>{t("status.none")}</h2>
        <p>{t("status.refreshHint")}</p>
        <button className="cta-button" onClick={handleRefresh}>
          {t("status.refresh")}
        </button>
      </div>
    );
  }

  // --- Main: hero-first layout ---

  return (
    <div className="app">
      {!introDone && <IntroScreen onDone={() => setIntroDone(true)} />}

      {introDone && personaPickerOpen && (
        <PersonaPicker onPick={onPersonaPick} />
      )}

      {/* Aurora blobs — decorative, pointer-events: none */}
      <div className="aurora" aria-hidden="true"><span /></div>

      <header className="app-header">
        <div className="app-brand">
          <img className="app-icon-img" src={`${import.meta.env.BASE_URL}icon-192.svg`} alt="" width="32" height="32" />
          <h1>
            Gotta Go
            <span className="app-tag" aria-hidden="true">{t("app.tagline")}</span>
          </h1>
        </div>
        <div className="header-right">
          <select
            className="lang-select"
            value={locale}
            onChange={(e) => {
              setLocale(e.target.value);
              trackEvent("locale_changed", { locale: e.target.value });
            }}
            aria-label="Language"
            title="Language"
          >
            {LOCALES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.flag} {l.code.toUpperCase()}
              </option>
            ))}
          </select>
          {points.total > 0 && (
            <div
              className="points-badge"
              title={`${points.total} contributor points · ${points.lifetime} lifetime`}
            >
              <span className="points-icon" aria-hidden="true">⚡</span>
              <span className="points-num">{points.total}</span>
            </div>
          )}
          {gamificationOn && streak.count > 0 && (
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
          {t("banner.fallback")}
        </div>
      )}

      {!isOnline && (
        <div className="offline-banner">
          📡 {t("banner.offline")}
        </div>
      )}

      {usingSearchedLocation && (
        <div className="searched-banner">
          🔎 {t("banner.searchedPrefix")} <strong>{searchedLocation.displayName?.split(",").slice(0, 2).join(",")}</strong>
          <button onClick={() => setSearchedLocation(null)} className="searched-clear">
            {t("banner.backToMe")}
          </button>
        </div>
      )}

      <SearchBar
        onPick={(loc) => {
          setSearchedLocation({
            latitude: loc.lat,
            longitude: loc.lng,
            displayName: loc.displayName,
          });
          setHeroIndex(0);
        }}
        onClear={() => setSearchedLocation(null)}
      />

      <FilterBar
        filters={filters}
        onChange={setFilters}
        onLocate={handleRefresh}
        countryOptions={countryOptions}
      />

      {/* Screen-reader announcement of hero changes — swipes and card
          promotions are pointer-driven and otherwise silent. */}
      <div className="sr-only" role="status" aria-live="polite">
        {hero &&
          `${safeIndex === 0 ? t("hero.closest") : t("hero.nth", { n: safeIndex + 1 })}: ${
            hero.name || "?"
          }, ${formatDistance(hero.distance)} ${t("hero.away")}`}
      </div>

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
          <span className="count-label">{t("count.nearby")}</span>
          {bucketCounts.close > 0 && (
            <>
              <span className="count-divider" />
              <span className="count-bucket">
                <strong>{bucketCounts.close}</strong> {t("count.within", { d: "500 m" })}
              </span>
            </>
          )}
          {bucketCounts.med > bucketCounts.close && (
            <span className="count-bucket count-bucket-dim">
              <strong>{bucketCounts.med}</strong> {t("count.within", { d: "1 km" })}
            </span>
          )}
        </div>

        {getSuppressedCount() > 0 && (
          <div className="suppressed-row">
            <span aria-hidden="true">👻</span>{" "}
            {t("suppressed.hidden", { n: getSuppressedCount() })}
            <button
              className="suppressed-restore"
              onClick={() => {
                clearSuppressed();
                setSuppressedTick((t) => t + 1);
                trackEvent("suppressed_restored");
              }}
            >
              {t("suppressed.restore")}
            </button>
          </div>
        )}

        {simpleMode ? (
          <SimpleHero
            restroom={hero}
            userPosition={position}
            onGo={() => handleGo(hero)}
            onNext={handleNext}
            onShowMore={toggleSimpleMode}
          />
        ) : (
          <HeroStack
            sorted={sorted}
            heroIndex={safeIndex}
            restroom={hero}
            userPosition={position}
            index={safeIndex}
            total={sorted.length}
            visitCount={hero ? visits[hero.id]?.count || 0 : 0}
            onGo={() => handleGo(hero)}
            onDetails={() => setDetailsOpen(hero)}
            onNext={handleNext}
            onPrev={handlePrev}
            onShowRoute={() => setMapOpen(true)}
          />
        )}

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

        {gamificationOn && sorted.length >= 3 && (
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
          🗺️  {t("map.viewAll", { n: sorted.length })}
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
          {t("add.button")}
        </button>

        <a
          className="tip-jar"
          href="https://buymeacoffee.com/holymushy"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackEvent("tip_clicked")}
        >
          ☕ {t("tip.button")}
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

      {installPrompt.visible && !mapOpen && (
        <InstallPrompt
          mode={installPrompt.mode}
          onInstall={installPrompt.install}
          onDismiss={installPrompt.dismiss}
        />
      )}

      {/* Floating Map pill — Airbnb-style "see results on map" */}
      {!mapOpen && sorted.length > 0 && (
        <button
          className="map-pill"
          onClick={() => {
            setMapOpen(true);
            trackEvent("map_opened", { restroom_count: sorted.length, source: "pill" });
          }}
          aria-label={`Show map (${sorted.length} bathrooms)`}
        >
          <span className="map-pill-icon">🗺️</span>
          <span className="map-pill-label">{t("map.label")}</span>
          <span className="map-pill-count">{sorted.length}</span>
        </button>
      )}

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
        achievement={gamificationOn ? achievement : null}
        onDismiss={() => setAchievement(null)}
      />

      <CelebrationOverlay
        isOpen={!!celebration}
        bathroomName={celebration?.bathroomName}
        pointsEarned={celebration?.pointsEarned}
        streakCount={celebration?.streakCount}
        onDone={() => setCelebration(null)}
      />

      {addOpen && (
        <AddBathroomModal
          position={geoPosition}
          onClose={() => setAddOpen(false)}
          onAdded={() => {
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
