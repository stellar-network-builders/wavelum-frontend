import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { decodeJwtExpiry, isJwtExpired, runSep10Flow } from '../sep10';
import { WalletConnectionError } from '../types';
import {
  getActiveNetwork,
  detectWallet,
  mapFreighterNetwork,
  requestPublicKey,
  signTransactionXdr,
} from '../walletClient';

/* Mock the Freighter extension API. */
vi.mock('@stellar/freighter-api', () => ({
  isConnected: vi.fn(),
  isAllowed: vi.fn(),
  requestAccess: vi.fn(),
  getAddress: vi.fn(),
  getNetwork: vi.fn(),
  signTransaction: vi.fn(),
  WatchWalletChanges: class {
    watch() {
      return {};
    }
    stop() {}
  },
}));

// Imported after vi.mock so these are the mocked handles; order is intentional.
// eslint-disable-next-line import/order
import {
  getNetwork,
  isConnected,
  requestAccess,
  signTransaction,
} from '@stellar/freighter-api';

const G_KEY = 'GABCDEFGHIJKLMNOPQRSTUVWXYZ234567ABCDEFGHIJKLMNOPQRST';

/** Build a JWT with the given `exp` (seconds since epoch). */
function makeJwt(expSeconds: number): string {
  const payload = Buffer.from(JSON.stringify({ exp: expSeconds })).toString('base64url');
  return `header.${payload}.sig`;
}

afterEach(() => {
  vi.clearAllMocks();
  vi.unstubAllGlobals();
});

describe('mapFreighterNetwork', () => {
  it('maps Freighter network strings to the app union', () => {
    expect(mapFreighterNetwork('PUBLIC')).toBe('mainnet');
    expect(mapFreighterNetwork('TESTNET')).toBe('testnet');
    expect(mapFreighterNetwork('FUTURENET')).toBe('futurenet');
    expect(mapFreighterNetwork('testnet')).toBe('testnet');
  });

  it('falls back to testnet for unknown networks', () => {
    expect(mapFreighterNetwork('SANDBOX')).toBe('testnet');
  });
});

describe('detectWallet', () => {
  it('returns true when Freighter reports connected', async () => {
    vi.mocked(isConnected).mockResolvedValue({ isConnected: true });
    await expect(detectWallet()).resolves.toBe(true);
  });

  it('returns false when the call throws', async () => {
    vi.mocked(isConnected).mockRejectedValue(new Error('no extension'));
    await expect(detectWallet()).resolves.toBe(false);
  });
});

describe('requestPublicKey', () => {
  it('returns the granted address', async () => {
    vi.mocked(requestAccess).mockResolvedValue({ address: G_KEY });
    await expect(requestPublicKey()).resolves.toBe(G_KEY);
  });

  it('throws a REJECTED WalletConnectionError when declined', async () => {
    vi.mocked(requestAccess).mockResolvedValue({
      address: '',
      error: { code: -1, message: 'User declined access' },
    });
    await expect(requestPublicKey()).rejects.toMatchObject({
      name: 'WalletConnectionError',
      code: 'REJECTED',
    });
  });
});

describe('getActiveNetwork', () => {
  it('maps the wallet network and returns the passphrase', async () => {
    vi.mocked(getNetwork).mockResolvedValue({
      network: 'TESTNET',
      networkPassphrase: 'Test SDF Network ; September 2015',
    });
    await expect(getActiveNetwork()).resolves.toEqual({
      network: 'testnet',
      networkPassphrase: 'Test SDF Network ; September 2015',
    });
  });
});

describe('signTransactionXdr', () => {
  it('returns the signed XDR', async () => {
    vi.mocked(signTransaction).mockResolvedValue({
      signedTxXdr: 'SIGNED_XDR',
      signerAddress: G_KEY,
    });
    await expect(signTransactionXdr('UNSIGNED')).resolves.toBe('SIGNED_XDR');
  });

  it('throws when the user rejects signing', async () => {
    vi.mocked(signTransaction).mockResolvedValue({
      signedTxXdr: '',
      signerAddress: '',
      error: { code: -1, message: 'User declined' },
    });
    await expect(signTransactionXdr('UNSIGNED')).rejects.toBeInstanceOf(WalletConnectionError);
  });
});

describe('JWT helpers', () => {
  it('decodes the exp claim into milliseconds', () => {
    expect(decodeJwtExpiry(makeJwt(1_000))).toBe(1_000_000);
  });

  it('returns null for malformed tokens', () => {
    expect(decodeJwtExpiry('not-a-jwt')).toBeNull();
  });

  it('detects expired and valid tokens', () => {
    const past = Math.floor(Date.now() / 1000) - 60;
    const future = Math.floor(Date.now() / 1000) + 3600;
    expect(isJwtExpired(makeJwt(past))).toBe(true);
    expect(isJwtExpired(makeJwt(future))).toBe(false);
  });
});

describe('runSep10Flow', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_API_URL = 'http://api.test';
  });

  it('runs challenge → sign → token and returns the JWT', async () => {
    const fetchMock = vi.fn()
      // 1) challenge
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          transaction: 'CHALLENGE_XDR',
          network_passphrase: 'Test SDF Network ; September 2015',
        }),
      })
      // 2) token exchange
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ token: 'JWT_TOKEN', user: { id: '1', publicKey: G_KEY } }),
      });
    vi.stubGlobal('fetch', fetchMock);

    const sign = vi.fn(async (xdr: string) => `SIGNED:${xdr}`);
    const result = await runSep10Flow({ account: G_KEY, sign });

    expect(sign).toHaveBeenCalledWith('CHALLENGE_XDR', 'Test SDF Network ; September 2015');
    expect(result.token).toBe('JWT_TOKEN');
    expect(result.user?.publicKey).toBe(G_KEY);

    // Challenge GET includes the account; token POST sends the signed XDR.
    expect(fetchMock.mock.calls[0][0]).toContain(`account=${G_KEY}`);
    expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toEqual({
      transaction: 'SIGNED:CHALLENGE_XDR',
    });
  });

  it('throws when the challenge request fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500 }));
    await expect(
      runSep10Flow({ account: G_KEY, sign: vi.fn() }),
    ).rejects.toThrow(/SEP-10 challenge/);
  });
});
