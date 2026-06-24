/**
 * Admin service.
 */

import type { AxiosRequestConfig } from 'axios';
import { apiClient } from './api/client';

function withSignal(signal?: AbortSignal): AxiosRequestConfig { return signal ? { signal } : {}; }

export interface AdminUser { id: string; publicKey: string; kycStatus: 'pending' | 'verified' | 'rejected'; role: 'admin' | 'contributor' | 'viewer'; createdAt: string; updatedAt?: string; }
export interface AdminUserFilters { kycStatus?: string; role?: string; page?: number; pageSize?: number; search?: string; }
export interface KycApprovalBody { status: 'verified' | 'rejected'; reason?: string; }
export interface VaultActionResponse { id: string; status: string; message: string; }

export const adminService = {
  getUsers(filters?: AdminUserFilters, signal?: AbortSignal) {
    return apiClient.get<{ data: AdminUser[]; total: number }>('/admin/users', { params: filters, ...withSignal(signal) });
  },
  getUserById(userId: string, signal?: AbortSignal) {
    return apiClient.get<{ data: AdminUser }>(`/admin/users/${userId}`, withSignal(signal));
  },
  approveKyc(userId: string, body: KycApprovalBody, signal?: AbortSignal) {
    return apiClient.patch<{ data: AdminUser }>(`/admin/users/${userId}/kyc`, body, withSignal(signal));
  },
  pauseVault(vaultId: string, signal?: AbortSignal) {
    return apiClient.post<VaultActionResponse>(`/admin/vaults/${vaultId}/pause`, undefined, withSignal(signal));
  },
  resumeVault(vaultId: string, signal?: AbortSignal) {
    return apiClient.post<VaultActionResponse>(`/admin/vaults/${vaultId}/resume`, undefined, withSignal(signal));
  },
  getStats(signal?: AbortSignal) {
    return apiClient.get<{ data: { totalUsers: number; totalVaults: number; totalClaimed: string; pendingKyc: number; activeStreams: number } }>('/admin/stats', withSignal(signal));
  },
};
