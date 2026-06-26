/**
 * Unit tests for the Soroban RPC client wrapper.
 *
 * The Stellar SDK is mocked so we can assert on call signatures and
 * return without hitting the network. This is the equivalent of mocking
 * Soroban RPC endpoints with nock/msw but at the SDK boundary, which is
 * more reliable for typed RPC clients.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Hoisted mock handles so the vi.mock factory below can reference them.
const {
  mockGetLedgerEntries,
  mockSimulateTransaction,
  mockSendTransaction,
  mockGetTransaction,
} = vi.hoisted(() => ({
  mockGetLedgerEntries: vi.fn(),
  mockSimulateTransaction: vi.fn(),
  mockSendTransaction: vi.fn(),
  mockGetTransaction: vi.fn(),
}));

vi.mock('@stellar/stellar-sdk', () => {
  class MockServer {
    public getLedgerEntries = mockGetLedgerEntries;
    public simulateTransaction = mockSimulateTransaction;
    public sendTransaction = mockSendTransaction;
    public getTransaction = mockGetTransaction;
  }

  class MockTransactionBuilder {
    public addOperation = vi.fn().mockReturnThis();
    public setTimeout = vi.fn().mockReturnThis();
    public build = vi.fn().mockReturnValue({ toXDR: () => 'mock-tx-xdr' });
  }

  class MockContract {
    public call = vi.fn().mockReturnValue({});
  }

  class MockAccount {
    public accountId = () => 'mock-account-id';
  }

  return {
    rpc: { Server: MockServer },
    TransactionBuilder: MockTransactionBuilder,
    Contract: MockContract,
    Account: MockAccount,
    Networks: {
      TESTNET: 'Test SDF Network ; September 2015',
      PUBLIC: 'Public Global Stellar Network ; September 2015',
      FUTURENET: 'Test SDF Future Network ; October 2022',
    },
    scValToNative: vi.fn((value: unknown) => value),
  };
});

import {
  createSorobanClient,
  getLedgerEntries,
  simulateTransaction,
  sendTransaction,
  getTransaction,
} from './sorobanClient';

describe('sorobanClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('createSorobanClient', () => {
    it('creates a new rpc.Server instance each call', () => {
      const clientA = createSorobanClient();
      const clientB = createSorobanClient();
      expect(clientA).toBeDefined();
      expect(clientB).toBeDefined();
    });
  });

  describe('getSorobanClient', () => {
    it('returns a cached singleton instance', async () => {
      // Reset modules so the module-scoped `_client` cache starts empty,
      // proving the singleton is created lazily on first call and reused afterwards.
      vi.resetModules();
      const { getSorobanClient: getClient } = await import('./sorobanClient');

      const first = getClient();
      const second = getClient();
      expect(first).toBe(second);
    });
  });

  describe('getLedgerEntries', () => {
    it('forwards the request to the rpc.Server and returns the result', async () => {
      const expected = {
        entries: [{ key: 'ledger-key', xdr: 'xdr-value', lastModifiedLedgerSeq: 100 }],
        latestLedger: 12345,
        latestLedgerCloseTime: '1700000000',
      };
      mockGetLedgerEntries.mockResolvedValueOnce(expected);

      const result = await getLedgerEntries(['ledger-key']);

      expect(mockGetLedgerEntries).toHaveBeenCalledTimes(1);
      expect(mockGetLedgerEntries).toHaveBeenCalledWith('ledger-key');
      expect(result).toEqual(expected);
    });

    it('propagates SDK errors', async () => {
      const sdkError = new Error('network unreachable');
      mockGetLedgerEntries.mockRejectedValueOnce(sdkError);

      await expect(getLedgerEntries(['key'])).rejects.toThrow('network unreachable');
    });
  });

  describe('simulateTransaction', () => {
    it('builds the transaction and forwards it to the rpc.Server', async () => {
      const expected = {
        transactionData: 'tx-data',
        events: [],
        cost: { cpuInsns: '100', memBytes: '200' },
        minResourceFee: '5000',
        results: [{ auth: [], xdr: 'result-xdr' }],
        latestLedger: 99,
      };
      mockSimulateTransaction.mockResolvedValueOnce(expected);

      const txBuilder = {
        build: vi.fn().mockReturnValue({ toXDR: () => 'built-xdr' }),
      } as unknown as Parameters<typeof simulateTransaction>[0];

      const result = await simulateTransaction(txBuilder);

      expect(txBuilder.build).toHaveBeenCalledTimes(1);
      expect(mockSimulateTransaction).toHaveBeenCalledTimes(1);
      expect(mockSimulateTransaction).toHaveBeenCalledWith({ toXDR: expect.any(Function) });
      expect(result).toEqual(expected);
    });
  });

  describe('sendTransaction', () => {
    it('submits a signed XDR envelope to the network', async () => {
      const expected = {
        status: 'PENDING' as const,
        hash: 'tx-hash',
        latestLedger: 1,
        latestLedgerCloseTime: '1700000000',
      };
      mockSendTransaction.mockResolvedValueOnce(expected);

      const result = await sendTransaction('signed-xdr-string');

      expect(mockSendTransaction).toHaveBeenCalledTimes(1);
      expect(mockSendTransaction).toHaveBeenCalledWith('signed-xdr-string');
      expect(result).toEqual(expected);
    });
  });

  describe('getTransaction', () => {
    it('returns the transaction confirmation by hash', async () => {
      const expected = {
        status: 'SUCCESS' as const,
        hash: 'tx-hash',
        latestLedger: 10,
        latestLedgerCloseTime: '1700000001',
      };
      mockGetTransaction.mockResolvedValueOnce(expected);

      const result = await getTransaction('tx-hash');

      expect(mockGetTransaction).toHaveBeenCalledTimes(1);
      expect(mockGetTransaction).toHaveBeenCalledWith('tx-hash');
      expect(result).toEqual(expected);
    });
  });
});
