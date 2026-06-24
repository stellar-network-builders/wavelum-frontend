/**
 * E2E test: Wallet connection flow.
 */

import { expect, test } from '@playwright/test';

test.describe('Wallet Connection Flow', () => {
  test('displays connect wallet button when no wallet is connected', async ({ page }) => {
    await page.goto('/');
    const connectButton = page.getByRole('button', { name: /connect/i });
    await expect(connectButton).toBeVisible();
  });

  test('dashboard renders without wallet', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.locator('main')).toBeVisible();
  });

  test('app does not crash without wallet', async ({ page }) => {
    await page.goto('/');
    const bodyText = await page.locator('body').innerText();
    expect(bodyText.length).toBeGreaterThan(0);
  });
});
