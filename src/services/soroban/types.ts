/**
 * TypeScript types for Soroban contract parameters, return values,
 * and RPC API responses.
 *
 * These types correspond to the Soroban JSON-RPC API and the typed
 * contract wrappers in the contracts/ directory.
 */

/* ─── RPC Response Types ─────────────────────────────────────────────────── */

export interface SorobanRpcResponse<T = unknown> {
  jsonrpc: '2.0';
  id: number;
  result?: T;
  error?: SorobanRpcError;
}

export interface SorobanRpcError {
  code: number;
  message: string;
  data?: unknown;
}

export interface GetLedgerEntriesResult {
  entries: LedgerEntryResult[];
  latestLedger: number;
  latestLedgerCloseTime: number;
  oldestLedger?: number;
  oldestLedgerCloseTime?: number;
}

export interface LedgerEntryResult {
  key: string;
  xdr: string;
  lastModifiedLedgerSeq: number;
  liveUntilLedgerSeq?: number;
}

export interface SimulateTransactionResult {
  transactionData: string;
  events: string[];
  cost: SimulateTransactionCost;
  minResourceFee: string;
  results: SimulateHostFunctionResult[];
  latestLedger: number;
}

export interface SimulateTransactionCost {
  cpuInsns: string;
  memBytes: string;
}

export interface SimulateHostFunctionResult {
  auth: string[];
  xdr: string;
}

export interface SendTransactionResult {
  status: SendTransactionStatus;
  hash: string;
  latestLedger: number;
  latestLedgerCloseTime: number;
}

export type SendTransactionStatus = 'PENDING' | 'DUPLICATE' | 'TRY_AGAIN_LATER' | 'ERROR';

export interface GetTransactionResult {
  status: GetTransactionStatus;
  hash: string;
  latestLedger: number;
  latestLedgerCloseTime: number;
  resultXdr?: string;
  returnValue?: string;
  applicationOrder?: number;
  errorResultXdr?: string;
}

export type GetTransactionStatus = 'SUCCESS' | 'NOT_FOUND' | 'FAILED';

/* ─── Network ────────────────────────────────────────────────────────────── */

export type SorobanNetwork = 'testnet' | 'mainnet' | 'futurenet';

/* ─── Contract Method Parameter Types ────────────────────────────────────── */

/** Common vesting vault parameters */
export interface VaultParams {
  vaultId: string;
}

export interface GetSubScheduleParams {
  vaultId: string;
  subScheduleId: string;
}

export interface GetClaimableAmountParams {
  vaultId: string;
  subScheduleId: string;
  beneficiary: string;
}

export interface ClaimParams {
  vaultId: string;
  subScheduleId: string;
  amount: string;
  beneficiary: string;
}

/** Token contract parameters */
export interface TokenBalanceParams {
  contractId: string;
  address: string;
}

/* ─── Contract Return Types ──────────────────────────────────────────────── */

export interface VaultInfo {
  id: string;
  name: string;
  admin: string;
  token: string;
  totalAllocated: string;
  totalClaimed: string;
  totalRemaining: string;
  status: number; // 0=Active, 1=Paused, 2=Completed, etc.
  createdAt: number;
}

export interface SubScheduleInfo {
  id: string;
  vaultId: string;
  beneficiary: string;
  totalAllocated: string;
  totalClaimed: string;
  startTimestamp: number;
  endTimestamp: number;
  cliffTimestamp: number;
  claimInterval: number;
  claimableAmount: string;
  lastClaimTimestamp: number;
  status: number;
}

export interface TokenInfo {
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
}

export interface TokenBalanceInfo {
  address: string;
  balance: string;
  contractId: string;
  symbol?: string;
  decimals?: number;
}

export interface ClaimResult {
  success: boolean;
  amount: string;
  txHash: string;
}
