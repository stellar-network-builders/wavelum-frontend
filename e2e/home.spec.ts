import { test, expect } from '@playwright/test';

test('Homepage visual baseline', async ({ page }) => {
  // Navigate to the local server started by the CI pipeline
  await page.goto('/');

  // Wait for animations/fonts to finish settling
  await page.waitForLoadState('networkidle');

  // Assert the visual screenshot matches the baseline
  await expect(page).toHaveScreenshot('home-page.png', {
    fullPage: true,
  });
});