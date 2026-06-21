import { test, expect } from '@playwright/test';

/**
 * Dashboard Navigation E2E Tests
 *
 * These tests validate the navigation structure and behavior of the Lumina
 * frontend application: locale routing, layout responsiveness, accessibility
 * landmarks, page metadata, and error resilience.
 *
 * Note: The full sidebar/dashboard navigation has not been built yet. The
 * existing navigation tests focus on the locale routing system and page
 * layout that are currently implemented.
 */

describe('Root Route Redirect', () => {
  test('redirects / to default locale /en', async ({ page }) => {
    await page.goto('/');
    await page.waitForURL(/\/en$/);
    expect(page.url()).toMatch(/\/en$/);
  });
});

describe('Locale Routing', () => {
  const locales = [
    { code: 'en', title: 'Lumina Network' },
    { code: 'ja', title: 'ルミナネットワーク' },
    { code: 'ko', title: '루미나 네트워크' },
    { code: 'zh', title: 'Lumina 网络' },
  ];

  for (const { code, title } of locales) {
    test(`renders ${code} locale page with correct title`, async ({ page }) => {
      await page.goto(`/${code}`);

      const h1 = page.getByRole('heading', { level: 1 });
      await expect(h1).toBeVisible();
      expect(await h1.textContent()).toBe(title);
    });
  }

  test('switches between all locales sequentially via select', async ({ page }) => {
    await page.goto('/en');
    const select = page.getByLabel('Change language');

    await select.selectOption('ja');
    await page.waitForURL(/\/ja$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('ルミナネットワーク');

    await select.selectOption('ko');
    await page.waitForURL(/\/ko$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('루미나 네트워크');

    await select.selectOption('zh');
    await page.waitForURL(/\/zh$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Lumina 网络');

    await select.selectOption('en');
    await page.waitForURL(/\/en$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Lumina Network');
  });

  test('locale switcher lists all four supported languages', async ({ page }) => {
    await page.goto('/en');
    const select = page.getByLabel('Change language');
    const options = await select.locator('option').allTextContents();

    expect(options).toContain('English');
    expect(options).toContain('日本語');
    expect(options).toContain('한국어');
    expect(options).toContain('中文');
  });

  test('locale switcher re-enables after navigation completes', async ({ page }) => {
    await page.goto('/en');
    const select = page.getByLabel('Change language');

    await expect(select).toBeEnabled();

    await select.selectOption('ja');
    await page.waitForURL(/\/ja$/);
    await expect(select).toBeEnabled();
  });
});

describe('Page Metadata per Locale', () => {
  test('English page has correct metadata', async ({ page }) => {
    await page.goto('/en');
    await expect(page).toHaveTitle('Lumina Network');

    const meta = page.locator('meta[name="description"]');
    await expect(meta).toHaveAttribute(
      'content',
      'Blockchain-based vesting vault and token streaming on Stellar Soroban',
    );
  });

  test('Japanese page has translated title', async ({ page }) => {
    await page.goto('/ja');
    await expect(page).toHaveTitle('ルミナネットワーク');
  });

  test('Korean page has translated title', async ({ page }) => {
    await page.goto('/ko');
    await expect(page).toHaveTitle('루미나 네트워크');
  });

  test('Chinese page has translated title', async ({ page }) => {
    await page.goto('/zh');
    await expect(page).toHaveTitle('Lumina 网络');
  });
});

describe('Layout Responsiveness', () => {
  const viewports = [
    { name: 'mobile', width: 375, height: 812 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'desktop', width: 1440, height: 900 },
  ];

  for (const { name, width, height } of viewports) {
    test(`renders correctly at ${name} viewport (${width}x${height})`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto('/en');

      // Essential landmarks exist
      const main = page.locator('#main-content');
      await expect(main).toBeAttached();

      // Title renders
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

      // Logo renders
      await expect(page.getByAltText('Next.js logo')).toBeVisible();
    });
  }

  test('mobile viewport shows action buttons', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/en');

    await expect(page.getByRole('link', { name: /Deploy Now/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Documentation/i })).toBeVisible();
  });
});

describe('External Navigation Links', () => {
  test('Deploy Now links to Vercel', async ({ page }) => {
    await page.goto('/en');
    const deployLink = page.getByRole('link', { name: /Deploy Now/i });
    await expect(deployLink).toHaveAttribute('href', 'https://vercel.com/new');
  });

  test('Documentation links to Next.js docs', async ({ page }) => {
    await page.goto('/en');
    const docsLink = page.getByRole('link', { name: /Documentation/i });
    await expect(docsLink).toHaveAttribute('href', 'https://nextjs.org/docs');
  });
});

describe('Error Resilience', () => {
  test('unsupported locale path returns 404', async ({ page }) => {
    const response = await page.goto('/xx');
    // Next.js should return 404 for unknown locale
    expect(response?.status()).toBe(404);
  });

  test('rapid locale switching does not crash the app', async ({ page }) => {
    await page.goto('/en');
    const select = page.getByLabel('Change language');

    // Switch through all locales with proper waits
    const localeSequence = ['ja', 'ko', 'zh', 'en'] as const;
    for (const locale of localeSequence) {
      await select.selectOption(locale);
      await page.waitForURL(`/${locale}`);
    }

    // Should land on English
    await expect(page).toHaveTitle('Lumina Network');
  });
});
