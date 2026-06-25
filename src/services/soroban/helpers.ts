/**
 * Shared Soroban helpers.
 *
 * Utilities used by contract wrappers to build read-only simulation transactions
 * using a dummy source account (standard practice for Soroban simulations).
 */

import type { xdr } from '@stellar/stellar-sdk';
import { Contract, Account, TransactionBuilder } from '@stellar/stellar-sdk';

import { getSorobanConfig } from '@/config/soroban';

/** Dummy public key for read-only simulation transactions. */
const DUMMY_PUBKEY = 'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF';

/**
 * Build a `TransactionBuilder` for a read-only contract call.
 *
 * The returned builder can be passed directly to `server.simulateTransaction()`
 * to decode the contract's return value without submitting to the network.
 *
 * @param contractId - The deployed contract address.
 * @param method     - The contract method name to call.
 * @param args       - Arguments to pass to the contract method (encoded as ScVal).
 */
export function buildReadOnlyTx(
  contractId: string,
  method: string,
  ...args: xdr.ScVal[]
): TransactionBuilder {
  const contract = new Contract(contractId);
  const op = contract.call(method, ...args);
  const config = getSorobanConfig();
  return new TransactionBuilder(new Account(DUMMY_PUBKEY, '0'), {
    fee: '100',
    networkPassphrase: config.networkPassphrase,
  })
    .addOperation(op)
    .setTimeout(300);
}
