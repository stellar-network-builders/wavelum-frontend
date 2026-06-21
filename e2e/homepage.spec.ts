import { test, expect } from '@playwright/test';

/**
 * Homepage E2E Tests
 *
 * Core page rendering and accessibility for the default locale (/en).
 * Comprehensive locale switching, metadata, and responsive tests are in
 * dashboard-navigation.spec.ts. Wallet integration tests are in wallet-connect.spec.ts.
 */
describe('Homepage', () => {
  test('should display the Lumina Network title', async ({ page }) => {
    await page.goto('/');

    // The root page redirects to /en (default locale)
    await page.waitForURL(/\/en/);

    const title = page.getByRole('heading', { level: 1 });
    await expect(title).toBeVisible();
    await expect(title).toHaveText('Lumina Network');
  });

  test('should have a skip-to-content link for keyboard users', async ({ page }) => {
    await page.goto('/en');
    const skipLink = page.locator('a[href="#main-content"]');
    await expect(skipLink).toBeAttached();

    // Should be the first focusable element
    await page.keyboard.press('Tab');
    await expect(skipLink).toBeFocused();
  });

  test('should show the locale switcher dropdown', async ({ page }) => {
    await page.goto('/en');
    const select = page.getByLabel('Change language');
    await expect(select).toBeAttached();
  });

  test('should switch language and show translated title', async ({ page }) => {
    await page.goto('/en');
    const select = page.getByLabel('Change language');
    await select.selectOption('ja');
    await page.waitForURL(/\/ja/);

    const title = page.getByRole('heading', { level: 1 });
    await expect(title).toBeVisible();
    await expect(title).toHaveText('ルミナネットワーク');
  });
});

describe('Accessibility', () => {
  test('should have a live region for screen-reader announcements', async ({ page }) => {
    await page.goto('/en');
    const liveRegion = page.locator('#a11y-announcements');
    await expect(liveRegion).toBeAttached();
    await expect(liveRegion).toHaveAttribute('aria-live');
  });

  test('should have a main content landmark', async ({ page }) => {
    await page.goto('/en');
    const main = page.locator('#main-content');
    await expect(main).toBeAttached();
    await expect(main).toHaveAttribute('role', 'main');
  });
});
