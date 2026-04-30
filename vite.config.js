import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
//
// `base` is set for GitHub Pages deploys (where the site lives under
// /restroom-finder/). Vercel/Netlify deploys should override this by
// setting VITE_BASE=/ in their env.
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE ?? '/restroom-finder/',
  build: {
    // Better chunking — split the heaviest libs out so the homepage
    // critical path stays small.
    rollupOptions: {
      output: {
        // Function form (required by rolldown). Returning a chunk name
        // pulls the module into a named chunk; returning undefined lets
        // the bundler decide.
        manualChunks(id) {
          if (id.includes("node_modules/opening_hours")) return "opening-hours";
          if (id.includes("node_modules/leaflet")) return "leaflet-stack";
          if (id.includes("node_modules/react-leaflet")) return "leaflet-stack";
        },
      },
    },
    chunkSizeWarningLimit: 800,
  },
})
