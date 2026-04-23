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
})
