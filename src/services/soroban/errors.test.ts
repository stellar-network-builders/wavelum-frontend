/**
 * Unit tests for Soroban error mapping.
 *
 * Validates RPC error codes, contract error codes, and the parseSorobanError
 * function convert raw errors to user-friendly messages.
 */

import { describe, expect, it } from 'vitest';

import {
  mapRpcError,
  mapContractError,
  parseSorobanError,
} from '@/services/soroban/errors';

describe('mapRpcError', () => {
  it('maps -32000 to contract call failure message', () => {
    expect(mapRpcError(-32000)).toContain('contract call failed');
  });

  it('maps -32001 to ledger entry not found message', () => {
    expect(mapRpcError(-32001)).toContain('ledger entry was not found');
  });

  it('maps -32002 to simulation failure message', () => {
    expect(mapRpcError(-32002)).toContain('simulation failed');
  });

  it('maps -32003 to budget exceeded message', () => {
    expect(mapRpcError(-32003)).toContain('budget was exceeded');
  });

  it('returns a generic message for unknown error codes', () => {
    const msg = mapRpcError(-99999);
    expect(msg).toContain('unexpected network error');
    expect(msg).toContain('-99999');
  });
});

describe('mapContractError', () => {
  it('maps vestingVault error code 1 to authorization message', () => {
    expect(mapContractError('vestingVault', 1)).toContain('not authorized');
  });

  it('maps vestingVault error code 4 to vesting not started message', () => {
    expect(mapContractError('vestingVault', 4)).toContain('not started yet');
  });

  it('maps vestingVault error code 8 to paused message', () => {
    expect(mapContractError('vestingVault', 8)).toContain('paused');
  });

  it('maps token error code 1 to insufficient balance message', () => {
    expect(mapContractError('token', 1)).toContain('Insufficient token balance');
  });

  it('maps token error code 2 to not authorized message', () => {
    expect(mapContractError('token', 2)).toContain('not authorized to transfer');
  });

  it('returns generic message for unknown contracts', () => {
    const msg = mapContractError('other', 99);
    expect(msg).toContain('Contract error');
    expect(msg).toContain('99');
  });

  it('returns generic message for unknown error codes', () => {
    const msg = mapContractError('vestingVault', 999);
    expect(msg).toContain('Vesting contract error');
    expect(msg).toContain('999');
  });
});

describe('parseSorobanError', () => {
  it('parses RPC-level error objects with code', () => {
    const error = { code: -32000, message: 'Something failed' };
    const msg = parseSorobanError(error);
    expect(msg).toContain('contract call failed');
  });

  it('parses contract-level errors embedded in data', () => {
    const error = {
      code: -32000,
      data: {
        type: 'ContractError',
        code: 4,
      },
    };
    const msg = parseSorobanError(error);
    expect(msg).toContain('not started yet');
  });

  it('falls back to the error message when no known code', () => {
    const error = { message: 'Custom error text' };
    const msg = parseSorobanError(error);
    expect(msg).toBe('Custom error text');
  });

  it('returns generic message for unknown error shapes', () => {
    expect(parseSorobanError(null)).toContain('unknown error');
    expect(parseSorobanError('string error')).toContain('unknown error');
    expect(parseSorobanError(undefined)).toContain('unknown error');
  });
});
