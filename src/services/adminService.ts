/**
 * Admin service — user/KYC management and vault administration.
 *
 * These endpoints require an `admin`-role JWT; a non-admin token yields a 403,
 * surfaced as an "insufficient permissions" toast by the response interceptor.
 */

import type { AdminUser } from '@/src/types/api';
import type { PaginatedResponse, PaginationParams, Vault } from '@/src/types/domain';

import { http } from './api/client';

export const adminService = {
  /** Paginated list of platform users with their KYC status. */
  getUsers: (params: PaginationParams = {}, signal?: AbortSignal) =>
    http.get<PaginatedResponse<AdminUser>>('/admin/users', {
      params: { page: params.page, pageSize: params.pageSize },
      signal,
    }),

  /** Approve a user's pending KYC submission. */
  approveKyc: (userId: string, signal?: AbortSignal) =>
    http.post<AdminUser>(`/admin/users/${userId}/kyc/approve`, undefined, { signal }),

  /** Pause claims on a vault (emergency administrative action). */
  pauseVault: (vaultId: string, signal?: AbortSignal) =>
    http.post<Vault>(`/admin/vaults/${vaultId}/pause`, undefined, { signal }),
};
