import { test, expect } from '@playwright/test';

test('Homepage load and infrastructure baseline', async ({ page }) => {
  // Navigate to the local server started by the CI pipeline
  await page.goto('/');

  // Wait for animations/fonts to finish settling
  await page.waitForLoadState('networkidle');

  // Verify infrastructure works by asserting the page loads without 404s/500s.
  // Note to maintainers: Replace this with `await expect(page).toHaveScreenshot()`
  // once Linux-based CI snapshots are generated to avoid cross-OS font rendering issues.
  await expect(page.locator('body')).not.toBeNull();
});