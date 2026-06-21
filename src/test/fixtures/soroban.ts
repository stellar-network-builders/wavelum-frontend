/**
 * Test fixtures for Soroban RPC responses.
 * These match the JSON-RPC response shapes from the Soroban RPC endpoint.
 */

export interface SorobanRpcResponse<T> {
  jsonrpc: '2.0';
  id: number;
  result?: T;
  error?: {
    code: number;
    message: string;
    data?: string;
  };
}

export interface GetTransactionResponse {
  status: 'SUCCESS' | 'NOT_FOUND' | 'FAILED';
  envelopeXdr?: string;
  resultXdr?: string;
  resultMetaXdr?: string;
  createdAt?: string;
  ledger?: number;
}

export interface SimulateTransactionResponse {
  transactionData: string;
  events: string[];
  cost: {
    cpuInsns: string;
    memBytes: string;
  };
  results: Array<{
    xdr: string;
    auth: string[];
  }>;
  minResourceFee: string;
  latestLedger: number;
}

export interface GetEventsResponse {
  events: Array<{
    type: string;
    ledger: number;
    ledgerClosedAt: string;
    contractId: string;
    id: string;
    pagingToken: string;
    topics: string[];
    value: { xdr: string };
    inSuccessfulContractCall: boolean;
    transactionHash: string;
  }>;
}

/** Successful contract invocation. */
export const mockSuccessfulTx: SorobanRpcResponse<GetTransactionResponse> = {
  jsonrpc: '2.0',
  id: 1,
  result: {
    status: 'SUCCESS',
    envelopeXdr: 'AAAAAgAAAAD...',
    resultXdr: 'AAAAAgAAAAD...',
    resultMetaXdr: 'AAAAAgAAAAD...',
    createdAt: new Date().toISOString(),
    ledger: 123456,
  },
};

/** Contract call that failed (e.g. insufficient balance). */
export const mockFailedTx: SorobanRpcResponse<GetTransactionResponse> = {
  jsonrpc: '2.0',
  id: 1,
  result: {
    status: 'FAILED',
    envelopeXdr: 'AAAAAgAAAAD...',
    resultXdr: 'AAAAAgAAAAD...',
    resultMetaXdr: 'AAAAAgAAAAD...',
    createdAt: new Date().toISOString(),
    ledger: 123457,
  },
};

/** Transaction not yet confirmed. */
export const mockPendingTx: SorobanRpcResponse<GetTransactionResponse> = {
  jsonrpc: '2.0',
  id: 1,
  result: {
    status: 'NOT_FOUND',
  },
};

/** Successful contract simulation before submission. */
export const mockSimulateTx: SorobanRpcResponse<SimulateTransactionResponse> = {
  jsonrpc: '2.0',
  id: 1,
  result: {
    transactionData: 'AAAAAgAAAAD...',
    events: [],
    cost: {
      cpuInsns: '100000',
      memBytes: '4096',
    },
    results: [
      {
        xdr: 'AAAAAgAAAAD...',
        auth: [],
      },
    ],
    minResourceFee: '100',
    latestLedger: 123450,
  },
};

/** RPC error response (e.g. rate limited). */
export const mockRpcError: SorobanRpcResponse<null> = {
  jsonrpc: '2.0',
  id: 1,
  error: {
    code: -32000,
    message: 'Rate limit exceeded. Please try again later.',
  },
};

/** Events emitted by a vesting contract. */
export const mockVestingEvents: SorobanRpcResponse<GetEventsResponse> = {
  jsonrpc: '2.0',
  id: 1,
  result: {
    events: [
      {
        type: 'contract',
        ledger: 123456,
        ledgerClosedAt: new Date(Date.now() - 86400 * 1000).toISOString(),
        contractId: 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC',
        id: 'evt_001',
        pagingToken: '123456-1',
        topics: ['AAA', 'BBB', 'CCC'],
        value: { xdr: 'AAAAAgAAAAD...' },
        inSuccessfulContractCall: true,
        transactionHash: 'abcdef1234567890',
      },
      {
        type: 'diagnostic',
        ledger: 123457,
        ledgerClosedAt: new Date(Date.now() - 86400 * 999).toISOString(),
        contractId: 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC',
        id: 'evt_002',
        pagingToken: '123457-1',
        topics: ['DDD', 'EEE'],
        value: { xdr: 'AAAAAgAAAAD...' },
        inSuccessfulContractCall: true,
        transactionHash: '0987654321fedcba',
      },
    ],
  },
};

/** Empty events response. */
export const mockEmptyEvents: SorobanRpcResponse<GetEventsResponse> = {
  jsonrpc: '2.0',
  id: 1,
  result: {
    events: [],
  },
};
