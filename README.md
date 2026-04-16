# Restroom Finder

Find public restrooms near you — fast, free, and mobile-first.

Powered by the free [Refuge Restrooms API](https://www.refugerestrooms.org/api/docs/) and [OpenStreetMap](https://www.openstreetmap.org).

## Features

- 📍 **Auto-detect location** via the browser's Geolocation API (with San Francisco fallback)
- 🗺️ **Interactive Leaflet map** with custom WC pins and a pulsing user dot
- 📋 **Sorted list** of nearby restrooms with distance (Haversine formula)
- ♿ **Accessibility filter** — toggle chips to show only accessible / gender-neutral options
- 👍 **Community ratings** — upvote/downvote counts from Refuge's crowdsourced data
- 🧭 **One-tap directions** — opens Google Maps for turn-by-turn navigation
- 📱 **PWA-ready** — installable on iOS and Android home screens, works with notched iPhone safe areas

## Stack

- [React 18](https://react.dev/) + [Vite](https://vitejs.dev/)
- [React-Leaflet](https://react-leaflet.js.org/) for the map
- Refuge Restrooms API (no API key required)
- Plain CSS (mobile-first, CSS custom properties, safe-area-inset support)

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

## Development

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # production build → dist/
npm run preview      # preview the production build
```

## Deployment

The `dist/` folder is static — deploy to Vercel, Netlify, Cloudflare Pages, GitHub Pages, etc.

## License

MIT
