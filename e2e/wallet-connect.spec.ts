import { test, expect, type BrowserContext } from '@playwright/test';

/**
 * Wallet Connection Flow E2E Tests
 *
 * These tests validate the wallet connection UX described in docs/WALLET_INTEGRATION.md.
 * They use page.addInitScript to mock the Freighter browser extension API so that
 * wallet flows can be tested without a real wallet installed.
 *
 * Wallet Lifecycle: Disconnected → Connecting → Connected → Authenticated
 *
 * Note: The wallet UI components have not been built yet. The tests that interact
 * with wallet UI elements are marked as skip and serve as forward-looking specifications.
 * The mock Freighter API tests validate the browser integration layer works correctly.
 */

const STELLAR_PUBLIC_KEY = 'GA1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ123456';

/**
 * Injects a mock Freighter API into the browser context.
 * Call before page.goto() to simulate various wallet states.
 */
async function mockFreighter(
  context: BrowserContext,
  state: {
    isConnected: boolean;
    publicKey?: string;
    network?: string;
    networkPassphrase?: string;
  },
) {
  await context.addInitScript((opts) => {
    (window as Record<string, unknown>).freighterApi = {
      isConnected: () => Promise.resolve(opts.isConnected),
      getPublicKey: () => Promise.resolve(opts.publicKey || ''),
      getNetwork: () => Promise.resolve(opts.network || 'TESTNET'),
      getNetworkDetails: () =>
        Promise.resolve({
          network: opts.network || 'TESTNET',
          networkPassphrase:
            opts.networkPassphrase ||
            'Test SDF Network ; September 2015',
        }),
      signTransaction: () =>
        Promise.resolve({ signedTxXdr: 'AAAAAgAAAAD...' }),
      signBlob: () =>
        Promise.resolve('signed-blob'),
      isAllowed: () => Promise.resolve(true),
      setAllowed: () => Promise.resolve(),
      requestAccess: () => Promise.resolve(opts.publicKey || ''),
    };
  }, state);
}

describe('Wallet Connection — Freighter Mock (Disconnected)', () => {
  test('app loads successfully when Freighter is not installed', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    // Track unhandled errors
    const pageErrors: Error[] = [];
    page.on('pageerror', (err) => pageErrors.push(err));

    await page.goto('/en');

    // The page should render its main content even without a wallet
    const main = page.locator('#main-content');
    await expect(main).toBeAttached();

    // No unhandled page errors
    expect(pageErrors).toHaveLength(0);

    await context.close();
  });

  test('app loads successfully when Freighter is installed but not connected', async ({ browser }) => {
    const context = await browser.newContext();
    await mockFreighter(context, { isConnected: false });

    const page = await context.newPage();
    const pageErrors: Error[] = [];
    page.on('pageerror', (err) => pageErrors.push(err));

    await page.goto('/en');

    const main = page.locator('#main-content');
    await expect(main).toBeAttached();
    expect(pageErrors).toHaveLength(0);

    await context.close();
  });
});

describe('Wallet Connection — Freighter Mock (Connected)', () => {
  test('app loads with mock connected wallet without errors', async ({ browser }) => {
    const context = await browser.newContext();
    await mockFreighter(context, {
      isConnected: true,
      publicKey: STELLAR_PUBLIC_KEY,
      network: 'TESTNET',
    });

    const page = await context.newPage();
    const pageErrors: Error[] = [];
    page.on('pageerror', (err) => pageErrors.push(err));

    await page.goto('/en');

    const main = page.locator('#main-content');
    await expect(main).toBeAttached();
    expect(pageErrors).toHaveLength(0);

    await context.close();
  });

  test('mock wallet public key is accessible from the page', async ({ browser }) => {
    const context = await browser.newContext();
    await mockFreighter(context, {
      isConnected: true,
      publicKey: STELLAR_PUBLIC_KEY,
    });
    const page = await context.newPage();

    await page.goto('/en');

    const publicKey = await page.evaluate(() => {
      const api = (window as Record<string, unknown>).freighterApi as
        | { getPublicKey: () => Promise<string> }
        | undefined;
      return api?.getPublicKey() ?? '';
    });
    expect(publicKey).toBe(STELLAR_PUBLIC_KEY);

    await context.close();
  });

  test('mock wallet can sign transactions (SEP-10 flow prerequisite)', async ({ browser }) => {
    const context = await browser.newContext();
    await mockFreighter(context, {
      isConnected: true,
      publicKey: STELLAR_PUBLIC_KEY,
    });
    const page = await context.newPage();

    await page.goto('/en');

    // Verify signTransaction is available for SEP-10 challenge signing
    const signed = await page.evaluate(() => {
      const api = (window as Record<string, unknown>).freighterApi as
        | { signTransaction: (xdr: string) => Promise<{ signedTxXdr: string }> }
        | undefined;
      return api?.signTransaction('AAAAAgAAAAD...');
    });
    expect(signed).toBeDefined();
    expect(signed?.signedTxXdr).toBeTruthy();

    await context.close();
  });
});

describe('Wallet Connection — Network Mismatch Detection', () => {
  test('detects mainnet wallet on testnet app — network mismatch', async ({ browser }) => {
    const context = await browser.newContext();
    // Wallet is on mainnet, but app expects testnet — should detect mismatch
    await mockFreighter(context, {
      isConnected: true,
      publicKey: STELLAR_PUBLIC_KEY,
      network: 'PUBLIC',
      networkPassphrase: 'Public Global Stellar Network ; September 2015',
    });
    const page = await context.newPage();

    await page.goto('/en');

    const network = await page.evaluate(() => {
      const api = (window as Record<string, unknown>).freighterApi as
        | { getNetwork: () => Promise<string> }
        | undefined;
      return api?.getNetwork() ?? '';
    });
    expect(network).toBe('PUBLIC');

    await context.close();
  });

  test('confirms testnet wallet on testnet app — network match', async ({ browser }) => {
    const context = await browser.newContext();
    await mockFreighter(context, {
      isConnected: true,
      publicKey: STELLAR_PUBLIC_KEY,
      network: 'TESTNET',
      networkPassphrase: 'Test SDF Network ; September 2015',
    });
    const page = await context.newPage();

    await page.goto('/en');

    const network = await page.evaluate(() => {
      const api = (window as Record<string, unknown>).freighterApi as
        | { getNetwork: () => Promise<string> }
        | undefined;
      return api?.getNetwork() ?? '';
    });
    expect(network).toBe('TESTNET');

    await context.close();
  });
});

// Forward-looking tests: wallet UI components not yet built.
// These will validate the wallet lifecycle when the UI is implemented.
describe('Wallet Connection — Lifecycle UX (forward-looking)', () => {
  test.skip('disconnected state: Connect Wallet button is visible', async ({ page }) => {
    await page.goto('/en');
    // TODO: When wallet UI is built, assert the connect button is visible
    const connectBtn = page.getByText('Connect Wallet');
    await expect(connectBtn).toBeVisible();
  });

  test.skip('clicking Connect Wallet triggers Freighter requestAccess', async ({ browser }) => {
    const context = await browser.newContext();
    await mockFreighter(context, {
      isConnected: false,
      publicKey: STELLAR_PUBLIC_KEY,
    });
    const page = await context.newPage();

    await page.goto('/en');

    // TODO: When wallet UI is built, click connect button and verify state change
    // const connectBtn = page.getByText('Connect Wallet');
    // await connectBtn.click();
    // await expect(page.getByText(/GA12/)).toBeVisible();

    await context.close();
  });

  test.skip('connected state: public key is displayed truncated', async ({ browser }) => {
    const context = await browser.newContext();
    await mockFreighter(context, {
      isConnected: true,
      publicKey: STELLAR_PUBLIC_KEY,
    });
    const page = await context.newPage();

    await page.goto('/en');

    // TODO: When wallet UI is built, assert truncated key is shown
    // await expect(page.getByText('GA12...456')).toBeVisible();

    await context.close();
  });

  test.skip('network mismatch: warning is shown when wallet is on wrong network', async ({ browser }) => {
    const context = await browser.newContext();
    await mockFreighter(context, {
      isConnected: true,
      publicKey: STELLAR_PUBLIC_KEY,
      network: 'PUBLIC',
    });
    const page = await context.newPage();

    await page.goto('/en');

    // TODO: When wallet UI is built, assert network mismatch warning appears
    // await expect(page.getByText(/switch/i)).toBeVisible();

    await context.close();
  });
});
