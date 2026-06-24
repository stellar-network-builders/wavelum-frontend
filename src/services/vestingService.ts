/**
 * Vesting service.
 */

import type { AxiosRequestConfig } from 'axios';
import { apiClient } from './api/client';

function withSignal(signal?: AbortSignal): AxiosRequestConfig { return signal ? { signal } : {}; }

export interface Vault {
  id: string; name: string; description?: string; network: string; contractAddress: string;
  tokenSymbol?: string; tokenDecimals?: number;
  totalAllocated: string; totalClaimed: string; totalRemaining: string;
  status: 'active' | 'paused' | 'completed' | 'expired' | 'cancelled';
  createdAt: string; updatedAt: string;
}
export interface VaultListResponse { data: Vault[]; total: number; page: number; pageSize: number; }
export interface VaultFilters { status?: string; network?: string; page?: number; pageSize?: number; search?: string; }
export interface SubSchedule {
  id: string; vaultId: string; name: string; scheduleType: 'linear' | 'cliff' | 'custom';
  cliffSeconds: number; startTimestamp: number; endTimestamp: number;
  totalAllocated: string; totalClaimed: string; totalRemaining: string;
  claimableAmount: string; nextClaimTimestamp: number;
  status: 'active' | 'paused' | 'completed'; vestingEvents: VestingEvent[];
}
export interface VestingEvent { amount: string; timestamp: number; claimed: boolean; txHash?: string; }
export interface ClaimRequest { subScheduleId: string; amount: string; }
export interface ClaimResponse { success: boolean; txHash: string; amount: string; newClaimableAmount: string; vaultId: string; subScheduleId: string; }

export const vestingService = {
  getVaults(filters?: VaultFilters, signal?: AbortSignal) {
    return apiClient.get<VaultListResponse>('/vaults', { params: filters, ...withSignal(signal) });
  },
  getVaultById(vaultId: string, signal?: AbortSignal) {
    return apiClient.get<{ data: Vault }>(`/vaults/${vaultId}`, withSignal(signal));
  },
  getSubSchedules(vaultId: string, signal?: AbortSignal) {
    return apiClient.get<{ data: SubSchedule[] }>(`/vaults/${vaultId}/sub-schedules`, withSignal(signal));
  },
  claimVesting(vaultId: string, body: ClaimRequest, signal?: AbortSignal) {
    return apiClient.post<ClaimResponse>(`/vaults/${vaultId}/claim`, body, withSignal(signal));
  },
};
