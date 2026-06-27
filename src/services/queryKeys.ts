import type { PaginationParams } from '@/src/types/domain';

export const queryKeys = {
  vaults: {
    all: ['vaults'] as const,
    lists: () => [...queryKeys.vaults.all, 'list'] as const,
    list: (params: PaginationParams = {}) =>
      [...queryKeys.vaults.lists(), params] as const,
    detail: (vaultId: string) =>
      [...queryKeys.vaults.all, 'detail', vaultId] as const,
  },
  vestings: {
    all: ['vestings'] as const,
    lists: () => [...queryKeys.vestings.all, 'list'] as const,
    list: (vaultId: string) =>
      [...queryKeys.vestings.lists(), vaultId] as const,
  },
  claims: {
    all: ['claims'] as const,
    lists: () => [...queryKeys.claims.all, 'list'] as const,
    list: (subScheduleId: string) =>
      [...queryKeys.claims.lists(), subScheduleId] as const,
  },
  portfolio: {
    all: ['portfolio'] as const,
    summary: () => [...queryKeys.portfolio.all, 'summary'] as const,
    tokenBalances: () => [...queryKeys.portfolio.all, 'token-balances'] as const,
  },
  admin: {
    all: ['admin'] as const,
    users: (params: PaginationParams = {}) =>
      [...queryKeys.admin.all, 'users', params] as const,
  },
} as const;
