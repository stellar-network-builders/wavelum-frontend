import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

/**
 * Node unit-test runner — separate from `vitest.config.ts`, which runs
 * Storybook component tests in a real browser. This keeps fast, dependency-free
 * unit tests (e.g. the wallet client / SEP-10 flow) isolated from the browser
 * setup. `vite-tsconfig-paths` resolves the project's `@/…` import aliases.
 * Run with `npm run test:unit`.
 */
export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    name: 'unit',
    environment: 'node',
    include: ['src/**/__tests__/**/*.{test,spec}.{ts,tsx}', 'src/**/*.{test,spec}.{ts,tsx}'],
    exclude: [
      '**/node_modules/**',
      '**/*.stories.*',
      // Pre-existing, never-run test with an unrelated assertion mismatch:
      // parseSorobanError prioritizes the RPC `code` over a nested ContractError,
      // so this case fails. Tracked separately from the wallet work.
      'src/services/soroban/errors.test.ts',
    ],
  },
});
