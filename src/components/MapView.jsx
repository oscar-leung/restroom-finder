import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import { useEffect, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
// Native leaflet.markercluster (side-effect: adds L.markerClusterGroup).
// The react-leaflet-cluster WRAPPER broke dev module init in this stack
// (see git history); driving the plugin imperatively avoids the wrapper.
import "leaflet.markercluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import { fetchWalkingRoute, describeStep, stepArrow } from "../services/routing";
import { formatDistance } from "../utils/distance";
import { useI18n } from "../i18n";

/**
 * Build a custom Leaflet DivIcon from an SVG string.
 * Using SVG = crisp at any zoom + no external image files.
 */
function svgIcon(svg, size = [32, 40]) {
  return L.divIcon({
    html: svg,
    className: "custom-pin", // we strip default styles via this class
    iconSize: size,
    iconAnchor: [size[0] / 2, size[1]], // point of pin at bottom-center
    popupAnchor: [0, -size[1]],
  });
}

// Blue pulsing dot for the user's location (like Google / Apple Maps)
const userDotIcon = L.divIcon({
  html: `
    <div class="user-dot">
      <div class="user-dot-pulse"></div>
      <div class="user-dot-core"></div>
    </div>`,
  className: "custom-pin",
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

// Restroom pin — color by selection / source, size by visit count.
// visitCount=0 → 32×40 (default); 1–2 → 38×48; 3+ → 46×58 ("frequent visit").
function restroomPin({ selected, accessible, source, visitCount = 0 }) {
  // Source-based coloring:
  //   - selected   → violet (highlighted hero)
  //   - user-added → amber (your contribution)
  //   - else       → indigo
  let fill = "#6366f1";
  if (selected) fill = "#8b5cf6";
  else if (source === "user") fill = "#f59e0b";

  // Size scales with personal visit count — your "concentration" hot spots
  let w = 32, h = 40;
  if (visitCount >= 3) { w = 46; h = 58; }
  else if (visitCount >= 1) { w = 38; h = 48; }

  const accessibleDot = accessible
    ? `<circle cx="${w * 0.75}" cy="${h * 0.25}" r="${w * 0.16}"
              fill="#10b981" stroke="white" stroke-width="1.5"/>`
    : "";

  // Visit-count badge for frequent spots (3+)
  const visitBadge = visitCount >= 3
    ? `<g transform="translate(${w - 14}, ${h - 28})">
         <circle cx="0" cy="0" r="9" fill="white" stroke="#f59e0b" stroke-width="2"/>
         <text x="0" y="3" text-anchor="middle" fill="#92400e"
               font-family="system-ui" font-size="10" font-weight="800">${visitCount}</text>
       </g>`
    : "";

  return svgIcon(`
    <svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
      <path d="M${w/2} 0C${w*0.225} 0 0 ${w*0.225} 0 ${w/2}c0 ${h*0.275} ${w/2} ${h*0.6} ${w/2} ${h*0.6}s${w/2} -${h*0.325} ${w/2} -${h*0.6}c0-${w*0.275}-${w*0.225}-${w/2}-${w/2}-${w/2}z"
            fill="${fill}" stroke="white" stroke-width="2"/>
      <text x="${w/2}" y="${h * 0.525}" text-anchor="middle" fill="white"
            font-family="system-ui" font-size="${Math.round(w * 0.44)}" font-weight="700">WC</text>
      ${accessibleDot}
      ${visitBadge}
    </svg>`, [w, h]);
}

/**
 * ClusteredPins — restroom markers managed imperatively inside a
 * leaflet.markercluster group. Dense downtowns collapse into numbered
 * cluster bubbles instead of 150 overlapping pins (the top "map
 * display issues" complaint against the competitor).
 *
 * The SELECTED pin is deliberately excluded — it renders as a normal
 * react-leaflet Marker so the route polyline always ends at a visible
 * pin, never inside a cluster bubble.
 */
function ClusteredPins({ restrooms, visits, selectedId, onSelect }) {
  const map = useMap();

  useEffect(() => {
    const group = L.markerClusterGroup({
      maxClusterRadius: 46,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      // Street level: show the actual pins, clustering has done its job
      disableClusteringAtZoom: 17,
      iconCreateFunction: (cluster) =>
        L.divIcon({
          html: `<div class="cluster-pin">${cluster.getChildCount()}</div>`,
          className: "custom-pin",
          iconSize: [40, 40],
          iconAnchor: [20, 20],
        }),
    });

    for (const r of restrooms) {
      if (r.id === selectedId) continue; // rendered unclustered outside
      const visitCount = visits[r.id]?.count || 0;
      const marker = L.marker([r.latitude, r.longitude], {
        icon: restroomPin({
          selected: false,
          accessible: r.accessible,
          source: r.source,
          visitCount,
        }),
      });
      marker.on("click", () => onSelect(r));
      group.addLayer(marker);
    }

    map.addLayer(group);
    return () => { map.removeLayer(group); };
  }, [map, restrooms, visits, selectedId, onSelect]);

  return null;
}

/**
 * RecenterMap — smoothly pans the map when `center` changes.
 * We use flyTo for a nice animated transition rather than a hard jump.
 */
function RecenterMap({ center, trigger }) {
  const map = useMap();
  useEffect(() => {
    if (!center) return;
    map.flyTo(center, 16, { duration: 0.6 });
    // Intentionally NOT depending on center/map: recentering on every
    // GPS jitter would fight the user's panning. Only an explicit
    // trigger bump (pin tap, "Near me") flies the camera.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger]);
  return null;
}

/**
 * MapView — renders the Leaflet map with user + restroom markers.
 *
 * Props:
 *   position     – { latitude, longitude } for user
 *   restrooms    – filtered + sorted array
 *   onSelect     – callback(restroom) when pin clicked
 *   selectedId   – id of currently selected restroom
 *   recenterKey  – change this number to force a recenter (e.g. "Near me" btn)
 */
export default function MapView({
  position,
  restrooms,
  visits = {},
  onSelect,
  selectedId,
  recenterKey,
}) {
  const { t } = useI18n();
  const center = [position.latitude, position.longitude];
  const hasVisits = Object.keys(visits).length > 0;

  // Real walking-route via OSRM (polyline + turn-by-turn steps).
  // Falls back to straight line if OSRM fails or returns nothing.
  // Keyed by (selection, origin) so a stale route never renders and the
  // effect needs no synchronous reset.
  const sel = restrooms.find((r) => r.id === selectedId);
  const routeKey = sel
    ? `${sel.id}|${position.latitude},${position.longitude}`
    : null;
  const [routeState, setRouteState] = useState({ key: null, route: null });
  const selLat = sel?.latitude;
  const selLng = sel?.longitude;
  useEffect(() => {
    if (!routeKey) return;
    let cancelled = false;
    const [, origin] = routeKey.split("|");
    const [lat, lng] = origin.split(",").map(Number);
    fetchWalkingRoute({ lat, lng }, { lat: selLat, lng: selLng }).then((res) => {
      if (cancelled || !res) return;
      setRouteState({ key: routeKey, route: res });
    });
    return () => { cancelled = true; };
  }, [routeKey, selLat, selLng]);
  const route = routeState.key === routeKey ? routeState.route : null;
  const routeCoords = route?.coordinates || null;

  return (
    <>
      <MapContainer
        center={center}
        zoom={15}
        className="map-container"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <RecenterMap center={center} trigger={recenterKey} />

        {/* User's live location */}
        <Marker position={center} icon={userDotIcon}>
          <Popup>You are here</Popup>
        </Marker>

        {/* Walking route from user to currently-selected bathroom.
            We try OSRM (real walking path) first; while it's loading or
            if it fails, show the straight-line fallback. */}
        {(() => {
          if (!sel) return null;
          const useReal = routeCoords && routeCoords.length > 1;
          const positions = useReal
            ? routeCoords
            : [center, [sel.latitude, sel.longitude]];
          return (
            <>
              {/* Soft halo behind the line */}
              <Polyline
                positions={positions}
                pathOptions={{
                  color: "#6366f1",
                  weight: 8,
                  opacity: 0.18,
                  lineCap: "round",
                }}
              />
              {/* Main line */}
              <Polyline
                positions={positions}
                pathOptions={{
                  color: "#6366f1",
                  weight: 4,
                  opacity: 0.95,
                  dashArray: useReal ? null : "8, 8",
                  lineCap: "round",
                }}
              />
            </>
          );
        })()}

        {/* Restroom pins — clustered natively (see ClusteredPins). */}
        <ClusteredPins
          restrooms={restrooms}
          visits={visits}
          selectedId={selectedId}
          onSelect={onSelect}
        />

        {/* The selected pin stays unclustered so the route line always
            ends at a visible marker */}
        {sel && (
          <Marker
            position={[sel.latitude, sel.longitude]}
            icon={restroomPin({
              selected: true,
              accessible: sel.accessible,
              source: sel.source,
              visitCount: visits[sel.id]?.count || 0,
            })}
            eventHandlers={{ click: () => onSelect(sel) }}
          >
            <Popup>
              {sel.name || "Unnamed restroom"}
            </Popup>
          </Marker>
        )}
      </MapContainer>

      {/* Turn-by-turn strip (P0 #6) — simplified directional steps from
          OSRM. The demo profile carries no street names, so each step
          is "Turn left · 120 m" style. Skip trivial 1-2 step routes. */}
      {route && route.steps && route.steps.length > 2 && (
        <div className="route-steps" role="list" aria-label="Walking directions">
          {route.steps.map((s, i) => (
            <span key={i} className="route-step" role="listitem">
              <span className="route-step-arrow" aria-hidden="true">{stepArrow(s)}</span>
              {describeStep(s)}
              {s.distance >= 10 && s.type !== "arrive" && (
                <span className="route-step-dist">{formatDistance(s.distance)}</span>
              )}
            </span>
          ))}
        </div>
      )}

      {/* Legend overlay */}
      <div className="map-legend" aria-hidden="true">
        <div className="map-legend-row">
          <span className="map-legend-pin map-legend-pin-default" />
          <span>{t("legend.public")}</span>
        </div>
        <div className="map-legend-row">
          <span className="map-legend-pin map-legend-pin-user" />
          <span>{t("legend.addedByYou")}</span>
        </div>
        {hasVisits && (
          <div className="map-legend-row">
            <span className="map-legend-pin map-legend-pin-visited" />
            <span>{t("legend.usuals")}</span>
          </div>
        )}
      </div>
    </>
  );
}
