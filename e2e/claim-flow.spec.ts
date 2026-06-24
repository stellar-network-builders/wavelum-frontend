/**
 * E2E test: Vesting claim flow.
 */

import { expect, test } from '@playwright/test';

test.describe('Claim Flow', () => {
  test('vesting page renders without crashing', async ({ page }) => {
    await page.goto('/vesting');
    await expect(page.locator('main, body')).toBeVisible();
    const pageContent = await page.locator('body').innerText();
    expect(pageContent.length).toBeGreaterThan(0);
  });

  test('page navigation is present', async ({ page }) => {
    await page.goto('/vesting');
    const nav = page.locator('nav, [role="navigation"], header');
    await expect(nav.first()).toBeVisible();
  });

  test('toast container exists in DOM', async ({ page }) => {
    await page.goto('/');
    const toastRegion = page.locator('[role="status"], [aria-live]');
    await expect(toastRegion.first()).toBeAttached();
  });
});
