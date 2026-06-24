/**
 * E2E test: Dashboard navigation.
 */

import { expect, test } from '@playwright/test';

const PAGES = ['/', '/vesting', '/streaming', '/wallet', '/admin', '/dashboard'];

test.describe('Dashboard Navigation', () => {
  for (const path of PAGES) {
    test(`renders ${path} without errors`, async ({ page }) => {
      const response = await page.goto(path);
      if (response) expect(response.status()).toBeLessThan(500);
      await expect(page.locator('body')).toBeVisible();
    });
  }

  test('sidebar navigation links are present', async ({ page }) => {
    await page.goto('/');
    const nav = page.locator('nav, [role="navigation"], aside');
    await expect(nav.first()).toBeVisible();
  });

  test('main content area is present', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('main')).toBeVisible();
  });
});
