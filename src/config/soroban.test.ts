/**
 * Unit tests for Soroban configuration.
 *
 * Validates network detection, contract address resolution,
 * and RPC URL configuration for testnet, mainnet, and futurenet.
 */

import { describe, expect, it } from 'vitest';

import {
  SOROBAN_CONFIG,
  getSorobanNetwork,
  getSorobanConfig,
  getContractAddress,
} from '@/config/soroban';

describe('SOROBAN_CONFIG', () => {
  it('has testnet configuration', () => {
    expect(SOROBAN_CONFIG.testnet).toBeDefined();
    expect(SOROBAN_CONFIG.testnet.rpcUrl).toBe('https://soroban-testnet.stellar.org');
    expect(SOROBAN_CONFIG.testnet.contracts.vestingVault).toBeDefined();
    expect(SOROBAN_CONFIG.testnet.contracts.token).toBeDefined();
    expect(SOROBAN_CONFIG.testnet.contracts.merkleVault).toBeDefined();
  });

  it('has mainnet configuration', () => {
    expect(SOROBAN_CONFIG.mainnet).toBeDefined();
    expect(SOROBAN_CONFIG.mainnet.rpcUrl).toBe('https://soroban.stellar.org');
  });

  it('has futurenet configuration', () => {
    expect(SOROBAN_CONFIG.futurenet).toBeDefined();
    expect(SOROBAN_CONFIG.futurenet.rpcUrl).toBe('https://rpc-futurenet.stellar.org');
  });
});

describe('getSorobanNetwork', () => {
  it('defaults to testnet', () => {
    expect(getSorobanNetwork()).toBe('testnet');
  });
});

describe('getSorobanConfig', () => {
  it('returns testnet config by default', () => {
    const config = getSorobanConfig();
    expect(config.rpcUrl).toBe('https://soroban-testnet.stellar.org');
    expect(config.contracts.vestingVault).toBeDefined();
  });
});

describe('getContractAddress', () => {
  it('returns the testnet vestingVault address', () => {
    const address = getContractAddress('vestingVault');
    expect(address).toBe(SOROBAN_CONFIG.testnet.contracts.vestingVault);
  });

  it('returns the testnet token address', () => {
    const address = getContractAddress('token');
    expect(address).toBe(SOROBAN_CONFIG.testnet.contracts.token);
  });

  it('returns the testnet merkleVault address', () => {
    const address = getContractAddress('merkleVault');
    expect(address).toBe(SOROBAN_CONFIG.testnet.contracts.merkleVault);
  });
});
