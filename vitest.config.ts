/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  test: {
    isolate: false,
    globals: true,
    globalSetup: ['./tests/helpers/global-setup.ts'],
    // setupFiles: ['./tests/helpers/setup.ts'],
    include: ['tests/**/*.test.ts'],
    testTimeout: 30000, // 30 seconds for database operations
    hookTimeout: 30000, // 30 seconds for setup/teardown

    // reporters: ['tree'],
  },
  plugins: [tsconfigPaths()],
})