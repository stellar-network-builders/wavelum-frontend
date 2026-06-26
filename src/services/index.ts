/**
 * Services module barrel export.
 *
 * Feature modules import API clients and external service integrations
 * from here rather than creating their own instances.
 */
export { ApiClient, createSorobanClient } from './api';
export type { ApiClientConfig, ApiResponse, ApiError } from './api';

// Centralized Axios HTTP client + typed service modules
export {
  apiClient,
  http,
  registerTokenGetter,
  registerUnauthorizedHandler,
  registerToastHandler,
} from './api/client';
export { queryKeys } from './queryKeys';
export { vestingService } from './vestingService';
export { authService } from './authService';
export { portfolioService } from './portfolioService';
export { adminService } from './adminService';

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
