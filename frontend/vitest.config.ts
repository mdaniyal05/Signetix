import path from 'node:path'
import { defineConfig } from 'vitest/config'

// Separate from vite.config.ts to avoid a plugin-type clash between Vite 8
// (rolldown) and vitest's bundled Vite. Tests are pure TS, so no React/Tailwind
// plugins are needed here — only the `@` path alias.
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
})
