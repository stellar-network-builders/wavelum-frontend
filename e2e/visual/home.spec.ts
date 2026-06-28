import { test, expect } from '@playwright/test';

/**
 * Visual regression baselines for top-level pages.
 *
 * Baselines are stored under `e2e/visual-baselines/`. To (re)generate after an
 * intentional UI change, run `npm run test:e2e:update` and commit the updated
 * PNGs. CI fails when the rendered page differs from its baseline by more than
 * the 1% pixel threshold configured in `playwright.config.ts`.
 */
test.describe('Visual regression', () => {
  test('home page matches baseline', async ({ page }) => {
    await page.goto('/');
    // Wait for the network to settle so fonts/assets are painted.
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('home.png', { fullPage: true });
  });
});
