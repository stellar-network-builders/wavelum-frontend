/**
 * React Query key factories.
 */

export const queryKeys = {
  vaults: {
    all: (filters?: Record<string, unknown>) => ['vaults', 'list', filters ?? {}] as const,
    byId: (vaultId: string) => ['vaults', 'detail', vaultId] as const,
    subSchedules: (vaultId: string) => ['vaults', vaultId, 'sub-schedules'] as const,
  },
  vestings: {
    all: (filters?: Record<string, unknown>) => ['vestings', 'list', filters ?? {}] as const,
    byId: (subScheduleId: string) => ['vestings', 'detail', subScheduleId] as const,
  },
  claims: {
    all: (filters?: Record<string, unknown>) => ['claims', 'list', filters ?? {}] as const,
    bySubSchedule: (subScheduleId: string) => ['claims', subScheduleId] as const,
  },
  portfolio: {
    summary: () => ['portfolio', 'summary'] as const,
    balances: () => ['portfolio', 'balances'] as const,
  },
  auth: {
    challenge: () => ['auth', 'challenge'] as const,
    session: () => ['auth', 'session'] as const,
  },
  admin: {
    users: (filters?: Record<string, unknown>) => ['admin', 'users', 'list', filters ?? {}] as const,
    userById: (userId: string) => ['admin', 'users', 'detail', userId] as const,
    vaults: (filters?: Record<string, unknown>) => ['admin', 'vaults', 'list', filters ?? {}] as const,
  },
} as const;

export type QueryKeys = typeof queryKeys;
