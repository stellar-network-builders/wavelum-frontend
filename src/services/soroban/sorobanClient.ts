/**
 * Soroban RPC client.
 *
 * Wraps the Stellar SDK's Soroban RPC server client with network-aware
 * configuration so the correct endpoint (testnet/mainnet/futurenet) is
 * used automatically.
 *
 * SDK v16 uses `rpc.Server` instead of the older `SorobanRpc.Server`.
 */

import type { Transaction } from '@stellar/stellar-sdk';
import { rpc, TransactionBuilder } from '@stellar/stellar-sdk';

import { getSorobanConfig } from '@/config/soroban';

export function createSorobanClient(): rpc.Server {
  const config = getSorobanConfig();
  return new rpc.Server(config.rpcUrl, {
    allowHttp: config.rpcUrl.startsWith('http://'),
  });
}

let _client: rpc.Server | null = null;

export function getSorobanClient(): rpc.Server {
  if (!_client) {
    _client = createSorobanClient();
  }
  return _client;
}

/* ─── Typed RPC Helpers ──────────────────────────────────────────────────── */

export async function getLedgerEntries(keys: string[]) {
  const client = getSorobanClient();
  return client.getLedgerEntries(...(keys as unknown as Parameters<rpc.Server['getLedgerEntries']>));
}

export async function simulateTransaction(tx: TransactionBuilder) {
  const client = getSorobanClient();
  return client.simulateTransaction(tx.build());
}

/**
 * Submit a signed transaction to the network.
 *
 * @param signedXdr - The signed transaction envelope XDR string.
 */
export async function sendTransaction(signedXdr: string) {
  const client = getSorobanClient();
  return client.sendTransaction(signedXdr as unknown as Transaction);
}

export async function getTransaction(hash: string) {
  const client = getSorobanClient();
  return client.getTransaction(hash);
}
