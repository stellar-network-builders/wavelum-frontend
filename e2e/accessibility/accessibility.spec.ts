import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page, type TestInfo } from '@playwright/test';

const locales = ['en', 'ja', 'ko', 'zh'] as const;
const routeSuffixes = [
  '',
  '/dashboard',
  '/dashboard/vaults',
  '/dashboard/claims',
  '/dashboard/streaming',
  '/dashboard/analytics',
  '/dashboard/admin',
] as const;

const auditedRoutes = locales.flatMap((locale) =>
  routeSuffixes.map((suffix) => `/${locale}${suffix}`),
);
type AxeResult = Awaited<ReturnType<AxeBuilder['analyze']>>;
type AxeViolation = AxeResult['violations'][number];

async function auditPage(page: Page): Promise<AxeResult> {
  return new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();
}
function formatViolations(violations: AxeViolation[]): string {
  if (violations.length === 0) return 'No accessibility violations detected.';

  return violations
    .map((violation) => {
      const nodes = violation.nodes
        .map((node) => `  - ${node.target.join(' ')}: ${node.failureSummary ?? 'No failure summary'}`)
        .join('\n');

      return `${violation.id} [${violation.impact ?? 'unknown'}] ${violation.help}\n${violation.helpUrl}\n${nodes}`;
    })
    .join('\n\n');
}

async function attachAxeReport(testInfo: TestInfo, route: string, result: AxeResult) {
  const slug = route.replace(/^\//, '').replaceAll('/', '-') || 'root';

  await testInfo.attach(`${slug}-axe.json`, {
    body: Buffer.from(JSON.stringify(result, null, 2)),
    contentType: 'application/json',
  });
}

test.describe('WCAG A/AA browser audits', () => {
  for (const route of auditedRoutes) {
    test(`${route} has no detectable WCAG A/AA violations`, async ({ page }, testInfo) => {
      const response = await page.goto(route, { waitUntil: 'domcontentloaded' });
      expect(response?.ok(), `${route} should return a successful response`).toBeTruthy();

      const expectedLocale = route.split('/')[1]!;
      await expect(page.locator('html')).toHaveAttribute('lang', expectedLocale);
      await page.locator('main').first().waitFor({ state: 'visible' });
      await page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => undefined);

      const result = await auditPage(page);
      await attachAxeReport(testInfo, route, result);

      expect(result.violations, formatViolations(result.violations)).toEqual([]);
    });
  }
});

test.describe('Keyboard-critical flows', () => {
  test('skip link moves focus to the main-content target', async ({ page }) => {
    await page.goto('/en', { waitUntil: 'domcontentloaded' });

    const skipLink = page.getByRole('link', { name: 'Skip to main content' });
    await page.keyboard.press('Tab');

    await expect(skipLink).toBeFocused();
    await expect(skipLink).toBeVisible();

    await skipLink.press('Enter');
    await expect(page.locator('#main-content')).toBeFocused();
  });

  test('dashboard tab order reaches every visible enabled interactive control', async ({ page }) => {
    await page.goto('/en/dashboard', { waitUntil: 'domcontentloaded' });
    await page.locator('main').waitFor({ state: 'visible' });

    const focusableSelector = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'summary',
      '[contenteditable="true"]',
      '[tabindex]:not([tabindex="-1"])',
    ].join(',');

    const expectedTargets = await page.locator(focusableSelector).evaluateAll((elements) => {
      let index = 0;
      return elements.flatMap((element) => {
        const node = element as HTMLElement;
        const style = getComputedStyle(node);
        const rect = node.getBoundingClientRect();
        const excluded =
          node.tabIndex < 0 ||
          node.getAttribute('aria-hidden') === 'true' ||
          node.closest('[inert]') !== null ||
          style.display === 'none' ||
          style.visibility === 'hidden' ||
          rect.width === 0 ||
          rect.height === 0;

        if (excluded) return [];

        const target = `focus-target-${index++}`;
        node.dataset.a11yTabTarget = target;
        return [target];
      });
    });

    expect(expectedTargets.length).toBeGreaterThan(0);
    const visited = new Set<string>();

    for (let step = 0; step < expectedTargets.length + 5; step += 1) {
      await page.keyboard.press('Tab');
      const target = await page.evaluate(
        () => (document.activeElement as HTMLElement | null)?.dataset.a11yTabTarget ?? '',
      );
      if (target) visited.add(target);
      if (expectedTargets.every((candidate) => visited.has(candidate))) break;
    }

    const unreachable = expectedTargets.filter((target) => !visited.has(target));
    expect(unreachable, `Unreachable keyboard targets: ${unreachable.join(', ')}`).toEqual([]);
  });
});
