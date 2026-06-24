/**
 * Portfolio service.
 */

import type { AxiosRequestConfig } from 'axios';
import { apiClient } from './api/client';

function withSignal(signal?: AbortSignal): AxiosRequestConfig { return signal ? { signal } : {}; }

export interface PortfolioSummary { totalValueUsd: string; totalClaimed: string; totalPending: string; vaults: number; activeStreams: number; }
export interface TokenBalance { address: string; balance: string; symbol: string; decimals: number; contractId: string; }
export interface ClaimHistory { id: string; vaultId: string; amount: string; tokenSymbol: string; txHash: string; claimedAt: string; }

export const portfolioService = {
  getPortfolioSummary(signal?: AbortSignal) {
    return apiClient.get<{ data: PortfolioSummary }>('/portfolio/summary', withSignal(signal));
  },
  getTokenBalances(signal?: AbortSignal) {
    return apiClient.get<{ data: TokenBalance[] }>('/portfolio/balances', withSignal(signal));
  },
  getClaimHistory(params?: { vaultId?: string; page?: number; pageSize?: number }, signal?: AbortSignal) {
    return apiClient.get<{ data: ClaimHistory[]; total: number }>('/portfolio/claims', { params, ...withSignal(signal) });
  },
};
