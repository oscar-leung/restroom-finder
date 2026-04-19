# Restroom Finder

> Find public restrooms near you — fast, free, and mobile-first.

A React + Vite web app that uses your phone's GPS to surface nearby public restrooms, including accessibility and gender-neutral options, on an interactive map. Powered by the free [Refuge Restrooms API](https://www.refugerestrooms.org/api/docs/) and [OpenStreetMap](https://www.openstreetmap.org).

## Why I built this

Finding a usable public restroom in an unfamiliar neighborhood is a small but genuinely annoying problem — one that's worse if you need an accessible or gender-neutral option. Refuge Restrooms maintains a great crowdsourced dataset, but the first-party UI isn't mobile-first and doesn't feel like something you'd reach for in a hurry. I wanted a lightweight PWA that felt like a native app: one tap to get your location, one glance to see what's nearby, one tap to navigate.

## When

April 2026. Built over a weekend as a mobile-first MVP and iterated from there.

## What it does

- **Auto-detects location** via the Geolocation API, with a San Francisco fallback if permission is denied
- **Interactive Leaflet map** with custom WC pins and a pulsing user-location dot
- **Sorted list** of nearby restrooms with distance computed via the Haversine formula
- **Accessibility filter** — toggle chips to narrow to accessible and/or gender-neutral options
- **Community ratings** surfaced inline — upvote/downvote counts from Refuge's crowdsourced data
- **One-tap directions** opens Google Maps for turn-by-turn navigation
- **PWA-ready** — installable on iOS and Android home screens, respects iPhone notch safe areas

## Tech stack

- [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- [React-Leaflet](https://react-leaflet.js.org/) for the map
- [Refuge Restrooms API](https://www.refugerestrooms.org/api/docs/) — no API key required
- Plain CSS (mobile-first, CSS custom properties, `safe-area-inset` support)
- ESLint 9 flat config

## What I learned

- **Geolocation in practice.** Permission flows vary wildly across browsers and OSes; a fallback coordinate plus a clear "use my location" affordance is worth more than trying to force permission up front.
- **Mobile-first CSS without a framework.** Using `safe-area-inset-*` env variables, container queries, and CSS custom properties to get a native-feeling layout without pulling in Tailwind or a component library.
- **PWA ergonomics.** Icons, manifests, and the iOS add-to-home-screen dance are fiddly but pay off in how the app feels.
- **Distance math on a sphere.** The Haversine formula is a great excuse to stop trusting Euclidean shortcuts over anything larger than a city block.

## Project structure

```
src/
├── hooks/
│   └── useGeolocation.js     # Browser GPS wrapper with refresh()
├── services/
│   └── restroomApi.js        # Refuge API client
├── utils/
│   └── distance.js           # Haversine formula + formatter
├── components/
│   ├── MapView.jsx           # Leaflet map + custom SVG pins
│   ├── FilterBar.jsx         # Horizontal chip row
│   ├── RestroomList.jsx      # Bottom sheet (mobile) / side drawer (desktop)
│   └── RestroomPanel.jsx     # Full details modal
├── App.jsx                   # Orchestrator
├── main.jsx                  # Entry point
└── index.css                 # All styles
```

## Run it locally

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # production build → dist/
npm run preview      # preview the production build
```

## Deployment

The `dist/` folder is static — deploy to Vercel, Netlify, Cloudflare Pages, GitHub Pages, or anywhere that serves static files.

## License

MIT

---

Built by **Oscar Leung** — [github.com/oscar-leung](https://github.com/oscar-leung)
