import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    exclude: [
      'ejemplos_visualizer/**',
      'node_modules',
      'dist',
      '.idea',
      '.git',
      'coverage',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['lcov', 'text-summary'],
      reportsDirectory: './coverage',
      exclude: [
        'ejemplos_visualizer/**',
        'vitest.config.ts',
      ],
    },
  },
})