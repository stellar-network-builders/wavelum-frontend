/**
 * Vesting service — vaults, sub-schedules, and claims.
 *
 * All functions accept an optional `AbortSignal` (forwarded to Axios) so React
 * Query can cancel in-flight requests on unmount or rapid navigation.
 */

import type {
  Claim,
  CreateVaultInput,
  PaginatedResponse,
  PaginationParams,
  Vault,
  VestingSchedule,
} from '@/src/types/domain';

import { http } from './api/client';

export const vestingService = {
  /** Paginated list of vaults. */
  getVaults: (params: PaginationParams = {}, signal?: AbortSignal) =>
    http.get<PaginatedResponse<Vault>>('/vaults', {
      params: { page: params.page, pageSize: params.pageSize },
      signal,
    }),

  /** A single vault by id. */
  getVaultById: (vaultId: string, signal?: AbortSignal) =>
    http.get<Vault>(`/vaults/${vaultId}`, { signal }),

  /** Vesting sub-schedules belonging to a vault. */
  getSubSchedules: (vaultId: string, signal?: AbortSignal) =>
    http.get<VestingSchedule[]>(`/vaults/${vaultId}/vestings`, { signal }),

  /** Claim history for a sub-schedule. */
  getClaims: (subScheduleId: string, signal?: AbortSignal) =>
    http.get<Claim[]>(`/vestings/${subScheduleId}/claims`, { signal }),

  /** Submit a claim against a vesting sub-schedule. */
  claimVesting: (subScheduleId: string, amount: string, signal?: AbortSignal) =>
    http.post<Claim>(`/vestings/${subScheduleId}/claims`, { amount }, { signal }),

  /** Create a new vesting vault. */
  createVault: (input: CreateVaultInput, signal?: AbortSignal) =>
    http.post<Vault>('/vaults', input, { signal }),
};
