import { defineConfig } from 'vitest/config'

// Unit tests cover the pure service/util layer — logic that runs the
// same in node as in the browser (localStorage is stubbed in setup).
// Component/E2E coverage stays in the browser (see PR smoke runs).
export default defineConfig({
  test: {
    environment: 'node',
    setupFiles: ['./tests/setup.js'],
    include: ['tests/**/*.test.js'],
  },
})
