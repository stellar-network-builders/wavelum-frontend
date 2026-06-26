/**
 * Thin, framework-agnostic wrapper around `@stellar/freighter-api`.
 *
 * This module deliberately imports nothing from the app's path aliases so it
 * stays unit-testable in isolation (the React provider and UI build on top of
 * it). All Freighter calls return `{ ..., error? }`; we normalize errors into
 * {@link WalletConnectionError} and map Freighter's network strings to our
 * {@link WalletNetwork} union.
 *
 * @see https://docs.freighter.app/
 */

import {
  getAddress,
  getNetwork,
  isAllowed,
  isConnected,
  requestAccess,
  signTransaction,
  WatchWalletChanges,
} from '@stellar/freighter-api';

import { WalletConnectionError, type WalletNetwork } from './types';

/* ─── Network mapping ────────────────────────────────────────────────────── */

const FREIGHTER_NETWORK_MAP: Record<string, WalletNetwork> = {
  PUBLIC: 'mainnet',
  TESTNET: 'testnet',
  FUTURENET: 'futurenet',
};

/** Map a Freighter network string (`PUBLIC` | `TESTNET` | …) to our union. */
export function mapFreighterNetwork(network: string): WalletNetwork {
  return FREIGHTER_NETWORK_MAP[network?.toUpperCase()] ?? 'testnet';
}

/* ─── Detection ──────────────────────────────────────────────────────────── */

/** Whether the Freighter browser extension is installed and reachable. */
export async function detectWallet(): Promise<boolean> {
  try {
    const result = await isConnected();
    return Boolean(result.isConnected);
  } catch {
    return false;
  }
}

/** Whether the user has already granted this site access to their wallet. */
export async function isWalletAllowed(): Promise<boolean> {
  try {
    const result = await isAllowed();
    return Boolean(result.isAllowed) && !result.error;
  } catch {
    return false;
  }
}

/* ─── Account & network ──────────────────────────────────────────────────── */

/**
 * Prompt the user to grant access and return the active public key.
 * @throws {WalletConnectionError} `REJECTED` if the user declines.
 */
export async function requestPublicKey(): Promise<string> {
  const result = await requestAccess();
  if (result.error || !result.address) {
    throw new WalletConnectionError(
      result.error?.message ?? 'Wallet access was rejected.',
      'REJECTED',
    );
  }
  return result.address;
}

/** The currently selected public key, or `null` if access isn't granted. */
export async function getActiveAddress(): Promise<string | null> {
  try {
    const result = await getAddress();
    if (result.error || !result.address) return null;
    return result.address;
  } catch {
    return null;
  }
}

export type ActiveNetwork = {
  network: WalletNetwork;
  networkPassphrase: string;
};

/** The wallet's active network, or `null` if it can't be read. */
export async function getActiveNetwork(): Promise<ActiveNetwork | null> {
  try {
    const result = await getNetwork();
    if (result.error || !result.network) return null;
    return {
      network: mapFreighterNetwork(result.network),
      networkPassphrase: result.networkPassphrase,
    };
  } catch {
    return null;
  }
}

/* ─── Signing ────────────────────────────────────────────────────────────── */

/**
 * Sign a transaction XDR with the connected wallet and return the signed XDR.
 * @throws {WalletConnectionError} `REJECTED` if the user declines to sign.
 */
export async function signTransactionXdr(
  xdr: string,
  opts?: { networkPassphrase?: string; address?: string },
): Promise<string> {
  const result = await signTransaction(xdr, opts);
  if (result.error || !result.signedTxXdr) {
    throw new WalletConnectionError(
      result.error?.message ?? 'Transaction signing was rejected.',
      'REJECTED',
    );
  }
  return result.signedTxXdr;
}

/* ─── Account/network change watching ────────────────────────────────────── */

export type WalletChange = {
  address: string;
  network: WalletNetwork;
  networkPassphrase: string;
};

/**
 * Watch for account or network changes the user makes inside Freighter.
 * Returns a `stop()` cleanup. Polls on the given interval (default 3s).
 */
export function watchWallet(
  onChange: (change: WalletChange) => void,
  timeoutMs = 3000,
): () => void {
  const watcher = new WatchWalletChanges(timeoutMs);
  watcher.watch((params) => {
    if (params.error) return;
    onChange({
      address: params.address,
      network: mapFreighterNetwork(params.network),
      networkPassphrase: params.networkPassphrase,
    });
  });
  return () => watcher.stop();
}
