/**
 * Soroban test fixtures — mock RPC responses for contract queries.
 */

export const mockTokenBalance = {
  address: 'GBJ5SZLKO3VYXKJ5F5KOGZDCRWWMMSEECAHGJHWOBGF7BPBTMJ4YJ7OC',
  balance: '5000000000000',
  symbol: 'LUM',
  decimals: 7,
  contractId: 'CAVH5J7TBQ4J6VPJSZJIYMHJB4H7MWFCNE7B7M3T3D4X4H5FLOPMNKCE',
};

export const mockGetLedgerEntriesResponse = {
  jsonrpc: '2.0', id: 1,
  result: {
    entries: [{ key: 'AAAAFA...', xdr: 'AAAAFA...', lastModifiedLedgerSeq: 1234567, liveUntilLedgerSeq: 0 }],
    latestLedger: 1234567, latestLedgerCloseTime: 1751328000,
    oldestLedger: 1234000, oldestLedgerCloseTime: 1751326000,
  },
};

export const mockSendTransactionResponse = {
  jsonrpc: '2.0', id: 3,
  result: { status: 'PENDING', hash: '0f1e2d...', latestLedger: 1234567, latestLedgerCloseTime: 1751328000 },
};

export const mockContractError = {
  jsonrpc: '2.0', id: 7,
  error: { code: -32000, message: 'Contract invocation failed', data: { type: 'ContractError', code: 4 } },
};
