import { useState, useEffect, useRef } from "react";
import { formatDistance } from "../utils/distance";
import { formatLastVisit } from "../services/visitTracker";
import { isOpenNow, formatHours, nextChange } from "../utils/hours";
import { isFavorite, toggleFavorite } from "../services/favorites";
import { tryUnlock } from "../services/achievements";
import { reportClean, getCleaningLog, formatRelative, getBountyStatus } from "../services/cleaningLog";
import { uploadPhoto, getPhotos } from "../services/photos";
import { reportCondition, getBathroomState, REPORT_TYPES } from "../services/conditionReports";
import { FIXTURE_FIELDS, getFixtureEdits, saveFixtureEdits, getMergedFixtures } from "../services/fixtures";
import { trackEvent } from "../utils/analytics";
import Reviews from "./Reviews";
import { useI18n } from "../i18n";
import { isBackendOn, fetchRemoteReports, fetchPopularity } from "../services/backend";

/**
 * RestroomPanel — full details modal for a selected restroom.
 * Slides up from the bottom on mobile, centered card on desktop.
 *
 * Props:
 *   restroom  – restroom object (or null)
 *   onClose   – close callback
 */
export default function RestroomPanel({ restroom, visitRecord, onClose, onAchievement }) {
  const { t } = useI18n();
  const [favorited, setFavorited] = useState(() =>
    restroom ? isFavorite(restroom.id) : false
  );
  const [cleaning, setCleaning] = useState(() =>
    restroom ? getCleaningLog(restroom.id) : null
  );
  const [photos, setPhotos] = useState([]);
  const [uploadError, setUploadError] = useState(null);
  const [bathState, setBathState] = useState(() =>
    restroom ? getBathroomState(restroom.id) : null
  );
  const [reportToast, setReportToast] = useState(null);
  // Fixture quick-edit form state — null = closed, object = draft values
  const [fixtureDraft, setFixtureDraft] = useState(null);
  const [fixtureSavedAt, setFixtureSavedAt] = useState(0); // bump to re-read merged view
  const fileRef = useRef(null);

  // Cross-user reports + GO count from the backend (null until deployed)
  const [remoteReports, setRemoteReports] = useState(null);
  const [goCount, setGoCount] = useState(null);

  // App keys this component by restroom id, so every open is a fresh
  // mount and the useState initializers above do the synchronous
  // hydration. This effect only loads the async sources.
  useEffect(() => {
    if (!restroom) return;
    let cancelled = false;
    // photos are async (IndexedDB)
    getPhotos(restroom.id).then((p) => { if (!cancelled) setPhotos(p); });
    if (isBackendOn()) {
      fetchRemoteReports(restroom.id).then((r) => {
        if (!cancelled && r && Object.keys(r.counts || {}).length) setRemoteReports(r);
      });
      fetchPopularity([restroom.id]).then((p) => {
        if (!cancelled && p[restroom.id] >= 2) setGoCount(p[restroom.id]);
      });
    }
    return () => { cancelled = true; };
  }, [restroom]);

  const onReport = (type) => {
    const result = reportCondition(restroom.id, type);
    if (!result) return;
    if (result.rateLimited) {
      setReportToast("Already reported recently — try again in 30 min.");
      setTimeout(() => setReportToast(null), 3000);
      return;
    }
    setBathState(getBathroomState(restroom.id));
    setReportToast(
      type === "not_here"
        ? `+${result.awarded} pts · hidden from your results (Restore on the main screen)`
        : `+${result.awarded} pts · thanks for reporting`
    );
    setTimeout(() => setReportToast(null), 3000);
    trackEvent("condition_reported", { id: String(restroom.id), type, points: result.awarded });
  };

  if (!restroom) return null;

  const onClean = () => {
    const updated = reportClean(restroom.id);
    setCleaning(updated);
    trackEvent("clean_reported", { id: String(restroom.id) });
  };

  const onPickFile = () => fileRef.current?.click();
  const onFileChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploadError(null);
    try {
      await uploadPhoto(restroom.id, file);
      const fresh = await getPhotos(restroom.id);
      setPhotos(fresh);
      trackEvent("photo_uploaded", { id: String(restroom.id) });
    } catch (err) {
      setUploadError(err.message || "Couldn't upload that photo.");
    }
  };

  const bounty = getBountyStatus(restroom.id);

  const onToggleFav = () => {
    const isNow = toggleFavorite(restroom.id);
    setFavorited(isNow);
    trackEvent("favorite_toggled", { id: String(restroom.id), on: isNow });
    if (isNow) {
      const ach = tryUnlock("first_favorite");
      if (ach && onAchievement) onAchievement(ach);
    }
  };

  // Street View deep-link — works without an API key, opens
  // Google Maps' panorama view of the location.
  const streetViewUrl = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${restroom.latitude},${restroom.longitude}`;

  const address = [restroom.street, restroom.city, restroom.state]
    .filter(Boolean)
    .join(", ");
  const score = (restroom.upvote || 0) - (restroom.downvote || 0);

  // Universal map link: on iOS opens Apple Maps, on Android opens Google Maps,
  // everywhere else opens maps.google.com. The `geo:` scheme is understood by
  // Android; iOS falls back to Google Maps URL.
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${restroom.latitude},${restroom.longitude}`;

  return (
    <>
      {/* Dark backdrop — tap to close */}
      <div className="modal-backdrop" onClick={onClose} />

      <div className="modal" role="dialog" aria-modal="true">
        {/* Grip handle for drag feel */}
        <div className="modal-grip" />

        <button className="modal-close" onClick={onClose} aria-label="Close">
          ×
        </button>

        <button
          className={`modal-fav ${favorited ? "modal-fav-on" : ""}`}
          onClick={onToggleFav}
          aria-pressed={favorited}
          aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
          title={favorited ? "Pinned to your speed dial" : "Pin to your speed dial"}
        >
          {favorited ? "★" : "☆"}
        </button>

        <h2 className="modal-title">{restroom.name || "Unnamed Restroom"}</h2>

        <div className="modal-meta">
          {restroom.distance != null && (
            <span className="meta-item">
              <span aria-hidden="true">📍</span> {formatDistance(restroom.distance)} {t("hero.away")}
            </span>
          )}
          {score !== 0 && (
            <span className="meta-item">
              {score > 0 ? "👍" : "👎"} {Math.abs(score)}
            </span>
          )}
          {goCount != null && (
            <span className="meta-item" title="Anonymous GO taps across all users">
              <span aria-hidden="true">🔥</span> {goCount}× GO
            </span>
          )}
          {visitRecord && visitRecord.count > 0 && (
            <span className="meta-item meta-visited">
              <span aria-hidden="true">👟</span> {visitRecord.count}× by you
              {visitRecord.lastVisited && ` · last ${formatLastVisit(visitRecord.lastVisited)}`}
            </span>
          )}
        </div>

        {address && <p className="modal-address">{address}</p>}

        <div className="modal-badges">
          {restroom.accessible && (
            <span className="badge badge-accessible">♿ {t("filter.accessible")}</span>
          )}
          {restroom.unisex && (
            <span className="badge badge-unisex">⚧ {t("filter.unisex")}</span>
          )}
          {restroom.fee === false && (
            <span className="badge badge-free">{t("filter.free")}</span>
          )}
          {restroom.fee === true && (
            <span className="badge badge-paid">{t("badge.paid")}</span>
          )}
          {restroom.single_occupant === true && (
            <span className="badge badge-private">🔒 {t("filter.private")}</span>
          )}
          {restroom.family === true && (
            <span className="badge badge-family">👨‍👩‍👧 {t("badge.family")}</span>
          )}
          {(() => {
            const { isOpen, knownStatus } = isOpenNow(restroom.opening_hours);
            if (!knownStatus) return null;
            return isOpen
              ? <span className="badge badge-open">🟢 {t("filter.openNow")}</span>
              : <span className="badge badge-closed">🔴 {t("badge.closed")}</span>;
          })()}
          {!restroom.accessible && !restroom.unisex && restroom.fee == null && !restroom.opening_hours && (
            <span className="badge badge-none">{t("badge.noInfo")}</span>
          )}
        </div>

        {restroom.opening_hours && (
          <section className="modal-section">
            <h3>{t("panel.hours")}</h3>
            <p>{formatHours(restroom.opening_hours)}</p>
            {(() => {
              // "Open until 17:00" / "Opens at 9:00" — null while the
              // lazy hours library loads or when unparseable
              const change = nextChange(restroom.opening_hours);
              return change ? <p className="muted">{change}</p> : null;
            })()}
          </section>
        )}

        {restroom.directions && (
          <section className="modal-section">
            <h3>{t("panel.directions")}</h3>
            <p>{restroom.directions}</p>
          </section>
        )}

        {restroom.comment && (
          <section className="modal-section">
            <h3>{t("panel.notes")}</h3>
            <p>{restroom.comment}</p>
          </section>
        )}

        {/* Photos section */}
        <section className="modal-section">
          <h3>{t("panel.photos")}</h3>
          {photos.length > 0 ? (
            <div className="photo-grid">
              {photos.map((p) => (
                <a
                  key={p.id}
                  href={p.dataUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="photo-thumb"
                >
                  <img src={p.dataUrl} alt="" loading="lazy" />
                </a>
              ))}
            </div>
          ) : (
            <p className="muted">{t("photos.empty")}</p>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={onFileChange}
            hidden
          />
          <button className="btn-secondary" onClick={onPickFile}>
            📷 {t("photos.upload")}
          </button>
          {uploadError && <p className="upload-error">{uploadError}</p>}
        </section>

        {/* Facilities — display merged fixture data + quick-edit form
            (ROADMAP "Fixture data": most entries lack tags; users fill
            the gap). fixtureSavedAt keys the memo-less re-read. */}
        {(() => {
          // fixtureSavedAt state-bump triggers this re-read after a save
          void fixtureSavedAt;
          const merged = getMergedFixtures(restroom);
          const known = FIXTURE_FIELDS.filter((f) => merged[f.key] !== null && merged[f.key] !== undefined);
          const openEdit = () => {
            const existing = getFixtureEdits(restroom.id) || {};
            setFixtureDraft({
              stalls: existing.stalls ?? "",
              sink: existing.sink === true ? "yes" : existing.sink === false ? "no" : "",
              paper_towels: existing.paper_towels === true ? "yes" : existing.paper_towels === false ? "no" : "",
              changing_table: existing.changing_table === true ? "yes" : existing.changing_table === false ? "no" : "",
            });
          };
          const save = () => {
            saveFixtureEdits(restroom.id, {
              stalls: fixtureDraft.stalls,
              sink: fixtureDraft.sink === "" ? null : fixtureDraft.sink === "yes",
              paper_towels: fixtureDraft.paper_towels === "" ? null : fixtureDraft.paper_towels === "yes",
              changing_table: fixtureDraft.changing_table === "" ? null : fixtureDraft.changing_table === "yes",
            });
            setFixtureDraft(null);
            setFixtureSavedAt(Date.now());
            trackEvent("fixtures_edited", { id: String(restroom.id) });
          };
          return (
            <section className="modal-section">
              <h3>{t("panel.facilities")} {merged.edited && <span className="fixtures-edited-tag">{t("facilities.yourEdits")}</span>}</h3>
              {known.length > 0 ? (
                <div className="fixtures-row">
                  {known.map((f) => (
                    <span key={f.key} className="fixtures-pill">
                      <span aria-hidden="true">{f.icon}</span>{" "}
                      {f.kind === "count"
                        ? `${merged[f.key]} ${t(`fixture.${f.key}`).toLowerCase()}`
                        : `${t(`fixture.${f.key}`)}: ${merged[f.key] ? t("common.yes").toLowerCase() : t("common.no").toLowerCase()}`}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="muted">{t("facilities.none")}</p>
              )}
              {fixtureDraft ? (
                <div className="fixtures-form">
                  <label className="fixtures-field">
                    <span>🚻 {t("fixture.stalls")}</span>
                    <input
                      type="number"
                      min="0"
                      max="99"
                      inputMode="numeric"
                      value={fixtureDraft.stalls}
                      onChange={(e) => setFixtureDraft({ ...fixtureDraft, stalls: e.target.value })}
                      placeholder="—"
                    />
                  </label>
                  {FIXTURE_FIELDS.filter((f) => f.kind === "bool").map((f) => (
                    <label key={f.key} className="fixtures-field">
                      <span>{f.icon} {t(`fixture.${f.key}`)}</span>
                      <select
                        value={fixtureDraft[f.key]}
                        onChange={(e) => setFixtureDraft({ ...fixtureDraft, [f.key]: e.target.value })}
                      >
                        <option value="">{t("facilities.dontKnow")}</option>
                        <option value="yes">{t("common.yes")}</option>
                        <option value="no">{t("common.no")}</option>
                      </select>
                    </label>
                  ))}
                  <div className="fixtures-form-actions">
                    <button className="btn-secondary" onClick={() => setFixtureDraft(null)}>{t("common.cancel")}</button>
                    <button className="btn-secondary fixtures-save" onClick={save}>{t("common.save")}</button>
                  </div>
                </div>
              ) : (
                <button className="btn-secondary" onClick={openEdit}>
                  ✏️ {known.length > 0 ? t("facilities.edit") : t("facilities.add")}
                </button>
              )}
            </section>
          );
        })()}

        {/* Condition report — GasBuddy-style one-tap status reporting */}
        <section className="modal-section">
          <h3>{t("panel.report")}</h3>
          <div className="condition-grid">
            {Object.entries(REPORT_TYPES).map(([type, meta]) => (
              <button
                key={type}
                className="condition-btn"
                onClick={() => onReport(type)}
                title={`+${meta.points} pts`}
              >
                <span className="condition-icon" aria-hidden="true">{meta.icon}</span>
                <span className="condition-label">{t(`report.${type}`)}</span>
                <span className="condition-pts">+{meta.points}</span>
              </button>
            ))}
          </div>
          {bathState && bathState.length > 0 && (
            <div className="condition-current">
              <span className="muted">Latest reports:</span>
              {bathState.map((r) => (
                <span key={r.type} className="condition-pill">
                  {REPORT_TYPES[r.type].icon} {t(`report.${r.type}`)}
                  <span className="condition-when">{formatRelative(r.ts)}</span>
                </span>
              ))}
            </div>
          )}
          {remoteReports && (
            <div className="condition-current condition-community">
              <span className="muted">Community (24h):</span>
              {Object.entries(remoteReports.counts)
                .filter(([type]) => REPORT_TYPES[type])
                .map(([type, n]) => (
                  <span key={type} className="condition-pill">
                    {REPORT_TYPES[type].icon} {t(`report.${type}`)}
                    <span className="condition-when">×{n}</span>
                  </span>
                ))}
            </div>
          )}
          {reportToast && <div className="condition-toast">{reportToast}</div>}
        </section>

        {/* Cleaning log + bounty */}
        <section className="modal-section">
          <h3>{t("panel.cleanliness")}</h3>
          {cleaning ? (
            <p className="muted">
              {t("clean.lastPrefix")} <strong>{formatRelative(cleaning.lastCleanedAt)}</strong>
              {cleaning.count > 1 && ` · ${t("clean.reportsTotal", { n: cleaning.count })}`}
            </p>
          ) : (
            <p className="muted">{t("clean.none")}</p>
          )}
          {bounty.eligible && (
            <div className="bounty-banner" title="Future feature — not yet payable">
              💵 <strong>${bounty.value.toFixed(2)}</strong> bounty available · {bounty.reason}
              <span className="bounty-soon">coming soon</span>
            </div>
          )}
          <button className="btn-secondary" onClick={onClean}>
            🧼 {t("clean.reportNow")}
          </button>
        </section>

        <a
          className="cta-button"
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackEvent("directions_opened", { id: String(restroom.id) })}
        >
          {t("panel.getDirections")}
        </a>

        <a
          className="secondary-link"
          href={streetViewUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackEvent("street_view_opened", { id: String(restroom.id) })}
        >
          🛣️ {t("panel.streetView")}
        </a>

        <Reviews restroomId={restroom.id} />
      </div>
    </>
  );
}
