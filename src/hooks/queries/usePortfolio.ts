import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/src/services/apiClient';
import { queryKeys } from '@/src/services/queryKeys';
import type {
  PaginatedResponse,
  Portfolio,
  TokenBalance,
  Vault,
} from '@/src/types/domain';

export function usePortfolio() {
  return useQuery({
    queryKey: queryKeys.portfolio.summary(),
    queryFn: async (): Promise<Portfolio> => {
      const [vaults, tokenBalances] = await Promise.all([
        apiFetch<PaginatedResponse<Vault>>('/vaults'),
        apiFetch<TokenBalance[]>('/portfolio/token-balances'),
      ]);

      return { vaults, tokenBalances };
    },
  });
}
