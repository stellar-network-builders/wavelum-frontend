/**
 * Soroban configuration.
 *
 * Network-aware RPC endpoints and contract address registry.
 * Switch between testnet / mainnet / futurenet by changing
 * the active network at runtime or via environment variable.
 */

import { Networks } from '@stellar/stellar-sdk';

/* ─── Contract Addresses ─────────────────────────────────────────────────── */

/**
 * Contract addresses keyed by network.
 *
 * Replace TODO placeholders with real deployed contract IDs
 * once the Soroban contracts are deployed on each network.
 */
const CONTRACT_ADDRESSES: Record<string, Record<string, string>> = {
  testnet: {
    vestingVault: 'CDLZFC3SYJYDZT7K67VZQK5HPHOJBXFHOE7EY3HGVXAZLDPTBH3P5JZM',
    token: 'CAVH5J7TBQ4J6VPJSZJIYMHJB4H7MWFCNE7B7M3T3D4X4H5FLOPMNKCE',
    merkleVault: 'CC2XZ3GCMKPM7PLBNWHTRHTYFLNBHF77FL6ML7S66JTB7X2W7ZS2HN64',
  },
  mainnet: {
    vestingVault: 'TODO_MAINNET_VESTING_VAULT',
    token: 'TODO_MAINNET_TOKEN',
    merkleVault: 'TODO_MAINNET_MERKLE_VAULT',
  },
  futurenet: {
    vestingVault: 'TODO_FUTURENET_VESTING_VAULT',
    token: 'TODO_FUTURENET_TOKEN',
    merkleVault: 'TODO_FUTURENET_MERKLE_VAULT',
  },
};

export type ContractName = 'vestingVault' | 'token' | 'merkleVault';

/* ─── RPC Configuration ──────────────────────────────────────────────────── */

export interface SorobanNetworkConfig {
  rpcUrl: string;
  networkPassphrase: string;
  contracts: Record<ContractName, string>;
}

export const SOROBAN_CONFIG: Record<string, SorobanNetworkConfig> = {
  testnet: {
    rpcUrl: 'https://soroban-testnet.stellar.org',
    networkPassphrase: Networks.TESTNET,
    contracts: CONTRACT_ADDRESSES.testnet as Record<ContractName, string>,
  },
  mainnet: {
    rpcUrl: 'https://soroban.stellar.org',
    networkPassphrase: Networks.PUBLIC,
    contracts: CONTRACT_ADDRESSES.mainnet as Record<ContractName, string>,
  },
  futurenet: {
    rpcUrl: 'https://rpc-futurenet.stellar.org',
    networkPassphrase: Networks.FUTURENET,
    contracts: CONTRACT_ADDRESSES.futurenet as Record<ContractName, string>,
  },
};

/* ─── Active Network ─────────────────────────────────────────────────────── */

export type SorobanNetwork = keyof typeof SOROBAN_CONFIG;

export function getSorobanNetwork(): SorobanNetwork {
  const env = process.env.NEXT_PUBLIC_SOROBAN_NETWORK;
  if (env && env in SOROBAN_CONFIG) {
    return env as SorobanNetwork;
  }
  return 'testnet';
}

export function getSorobanConfig(): SorobanNetworkConfig {
  return SOROBAN_CONFIG[getSorobanNetwork()];
}

export function getContractAddress(name: ContractName): string {
  const config = getSorobanConfig();
  return config.contracts[name];
}
