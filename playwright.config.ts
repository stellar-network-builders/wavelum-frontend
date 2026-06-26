import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for end-to-end visual regression testing.
 *
 * Baseline screenshots live in `e2e/visual-baselines/`. Generate or refresh
 * them locally with `npm run test:e2e:update`, then commit the PNGs. CI
 * (`.github/workflows/visual-regression.yml`) compares PR screenshots against
 * the committed baselines and fails when the diff exceeds the 1% threshold.
 *
 * Note: this is independent of the Vitest + `@vitest/browser-playwright`
 * setup used for Storybook component tests (see `vitest.config.ts`).
 */
export default defineConfig({
  testDir: './e2e',
  snapshotDir: './e2e/visual-baselines',
  // Keep results deterministic for pixel comparisons.
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [['html', { open: 'never' }], ['github']] : 'html',

  expect: {
    // Fail when more than 1% of pixels differ from the baseline.
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.01,
      animations: 'disabled',
    },
  },

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Build once and serve the production bundle so screenshots reflect what
  // ships, not the dev overlay.
  webServer: {
    command: 'npm run build && npm run start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
