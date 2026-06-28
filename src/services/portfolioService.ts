/**
 * Portfolio service — aggregated holdings for the connected account.
 */

import type { Portfolio, TokenBalance } from '@/src/types/domain';

import { http } from './api/client';
import { vestingService } from './vestingService';

export const portfolioService = {
  /** Raw token balances held by the account. */
  getTokenBalances: (signal?: AbortSignal) =>
    http.get<TokenBalance[]>('/portfolio/token-balances', { signal }),

  /**
   * Composed portfolio summary: the account's vaults alongside its token
   * balances, fetched in parallel.
   */
  getPortfolioSummary: async (signal?: AbortSignal): Promise<Portfolio> => {
    const [vaults, tokenBalances] = await Promise.all([
      vestingService.getVaults({}, signal),
      portfolioService.getTokenBalances(signal),
    ]);

    return { vaults, tokenBalances };
  },
};
