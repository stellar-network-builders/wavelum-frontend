import { QueryClient } from '@tanstack/react-query';

const MAX_RETRY_DELAY_MS = 30_000;

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
