/**
 * Contract address registry.
 *
 * Central lookup for deployed Soroban contract addresses per network.
 * Used by contract wrapper classes and the transaction builder.
 */

import { Contract } from '@stellar/stellar-sdk';

import { getContractAddress } from '@/config/soroban';
import type { ContractName } from '@/config/soroban';
export type { ContractName };

/**
 * Resolve a contract address for the currently active network.
 */
export function resolveContractAddress(name: ContractName): string {
  return getContractAddress(name);
}

/**
 * Build a Stellar `Contract` instance for a given contract name.
 */
export function getContract(name: ContractName): Contract {
  const address = resolveContractAddress(name);
  return new Contract(address);
}
