/**
 * SEP-10 Stellar Web Authentication client.
 *
 * Flow: request a challenge transaction from the backend → sign it with the
 * wallet → exchange the signed XDR for a JWT session token.
 *
 * Kept free of app path-alias imports so it stays unit-testable. The signer is
 * injected by the caller (the wallet provider passes Freighter's signer).
 *
 * @see https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0010.md
 */

const DEFAULT_API_URL = 'http://localhost:4000';
const DEFAULT_AUTH_PATH = '/auth/sep10';

function authEndpoint(): string {
  const base = process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_URL;
  const path = process.env.NEXT_PUBLIC_SEP10_AUTH_PATH ?? DEFAULT_AUTH_PATH;
  return `${base}${path}`;
}

export type Sep10Challenge = {
  transaction: string;
  networkPassphrase: string;
};

export type Sep10Result = {
  token: string;
  /** Optional user payload some backends return alongside the token. */
  user?: { id: string; publicKey: string; role?: 'user' | 'admin' } | null;
};

/** A function that signs the challenge XDR and returns the signed XDR. */
export type ChallengeSigner = (
  transactionXdr: string,
  networkPassphrase: string,
) => Promise<string>;

/* ─── HTTP steps ─────────────────────────────────────────────────────────── */

/** Step 1 — fetch the unsigned SEP-10 challenge for an account. */
export async function requestSep10Challenge(account: string): Promise<Sep10Challenge> {
  const url = `${authEndpoint()}?account=${encodeURIComponent(account)}`;
  const response = await fetch(url, { headers: { Accept: 'application/json' } });

  if (!response.ok) {
    throw new Error(`SEP-10 challenge request failed (${response.status}).`);
  }

  const body = (await response.json()) as Record<string, unknown>;
  const transaction = (body.transaction ?? body.challenge) as string | undefined;
  const networkPassphrase = (body.networkPassphrase ?? body.network_passphrase) as
    | string
    | undefined;

  if (!transaction) {
    throw new Error('SEP-10 challenge response did not include a transaction.');
  }

  return { transaction, networkPassphrase: networkPassphrase ?? '' };
}

/** Step 3 — exchange the signed challenge XDR for a JWT. */
export async function submitSep10Challenge(signedXdr: string): Promise<Sep10Result> {
  const response = await fetch(authEndpoint(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ transaction: signedXdr }),
  });

  if (!response.ok) {
    throw new Error(`SEP-10 token exchange failed (${response.status}).`);
  }

  const body = (await response.json()) as { token?: string; user?: Sep10Result['user'] };
  if (!body.token) {
    throw new Error('SEP-10 token response did not include a token.');
  }

  return { token: body.token, user: body.user ?? null };
}

/**
 * Full SEP-10 handshake: challenge → sign → token. The `sign` callback is
 * injected so this is independent of any specific wallet.
 */
export async function runSep10Flow(params: {
  account: string;
  sign: ChallengeSigner;
}): Promise<Sep10Result> {
  const challenge = await requestSep10Challenge(params.account);
  const signedXdr = await params.sign(challenge.transaction, challenge.networkPassphrase);
  return submitSep10Challenge(signedXdr);
}

/* ─── JWT helpers ────────────────────────────────────────────────────────── */

/** Decode a JWT's `exp` claim, returned in milliseconds (or `null`). */
export function decodeJwtExpiry(token: string): number | null {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const json = JSON.parse(atob(base64)) as { exp?: number };
    return typeof json.exp === 'number' ? json.exp * 1000 : null;
  } catch {
    return null;
  }
}

/**
 * Whether a JWT is expired. `skewMs` treats tokens expiring within the window
 * as already expired (default 30s) to avoid races on near-expiry requests.
 */
export function isJwtExpired(token: string, skewMs = 30_000): boolean {
  const expiry = decodeJwtExpiry(token);
  if (expiry === null) return false; // Unparseable exp → let the server decide.
  return Date.now() >= expiry - skewMs;
}
