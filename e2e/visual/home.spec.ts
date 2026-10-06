import { test, expect } from '@playwright/test';

/**
 * Visual regression baselines for top-level pages.
 *
 * Baselines are stored under `e2e/visual-baselines/`. To (re)generate after an
 * intentional UI change, run `npm run test:e2e:update` and commit the updated
 * PNGs. CI fails when the rendered page differs from its baseline by more than
 * the 1% pixel threshold configured in `playwright.config.ts`.
 */
test.use({
  viewport: { width: 1280, height: 720 },
  colorScheme: 'light',
  locale: 'en-US',
  timezoneId: 'UTC',
  reducedMotion: 'reduce',
});

test.describe('Visual regression', () => {
  test('home page matches baseline', async ({ page }) => {
    await page.goto('/en');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    // Wait for actual render assets, without depending on background requests.
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all(Array.from(document.images, (image) => image.decode()));
    });
    await expect(page).toHaveScreenshot('home.png', { fullPage: true });
  });
});
