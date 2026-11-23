import { QueryClient } from '@tanstack/react-query';

const MAX_RETRY_DELAY_MS = 30_000;

/**
 * Application-wide TanStack Query client — the single source of truth for
 * server state, as documented in docs/STATE_MANAGEMENT.md.
 *
 * Feature code must consume server state through the hooks in
 * src/hooks/queries and src/hooks/mutations (which use this client) rather
 * than calling the API client directly. Direct fetch/API calls are
 * disallowed by ESLint to keep server state centralized and cacheable.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 300_000,
      refetchOnWindowFocus: true,
      retry: 2,
      retryDelay: (attemptIndex) =>
        Math.min(1_000 * 2 ** attemptIndex, MAX_RETRY_DELAY_MS),
    },
    mutations: {
      retry: 0,
    },
  },
});