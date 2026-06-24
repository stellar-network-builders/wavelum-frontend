/**
 * Services module barrel export.
 */
export { ApiClient, createSorobanClient } from './api';
export type { ApiClientConfig, ApiResponse, ApiError } from './api';

// Soroban layer
export {
  getSorobanClient,
  getLedgerEntries,
  simulateTransaction,
  sendTransaction,
  getTransaction,
  resolveContractAddress,
  getContract,
  VestingVaultContract,
  TokenContract,
  SorobanTransactionBuilder,
  parseSorobanError,
  mapRpcError,
  mapContractError,
} from './soroban';
export type {
  VaultInfo,
  SubScheduleInfo,
  TokenBalanceInfo,
  ClaimResult,
  ClaimParams,
  GetClaimableAmountParams,
  GetSubScheduleParams,
  TokenBalanceParams,
  SorobanRpcResponse,
  SorobanRpcError,
  GetLedgerEntriesResult,
  SimulateTransactionResult,
  SendTransactionResult,
  GetTransactionResult,
  SorobanNetwork,
} from './soroban';
