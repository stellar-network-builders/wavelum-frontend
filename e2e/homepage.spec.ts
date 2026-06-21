import { test, expect } from '@playwright/test';

describe('Homepage', () => {
  test('should display the application title', async ({ page }) => {
    await page.goto('/');

    // The root page redirects to /en (default locale)
    await page.waitForURL(/\/en/);

    const title = page.locator('h1');
    await expect(title).toBeVisible();
    expect(await title.textContent()).toBeTruthy();
  });

  test('should have a skip-to-content link', async ({ page }) => {
    await page.goto('/en');
    const skipLink = page.locator('a[href="#main-content"]');
    await expect(skipLink).toBeAttached();
  });

  test('should show the locale switcher', async ({ page }) => {
    await page.goto('/en');
    const select = page.locator('#locale-switcher');
    await expect(select).toBeAttached();
  });
});

describe('LocaleSwitcher', () => {
  test('should navigate when changing language', async ({ page }) => {
    await page.goto('/en');
    const select = page.locator('#locale-switcher');
    await expect(select).toBeAttached();
    await select.selectOption('ja');
    await page.waitForURL(/\/ja/);
    const title = page.locator('h1');
    // The title should now be in Japanese
    await expect(title).toBeVisible();
    expect(await title.textContent()).toContain('ルミナネットワーク');
  });
});

describe('Accessibility', () => {
  test('should have a live region for announcements', async ({ page }) => {
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
