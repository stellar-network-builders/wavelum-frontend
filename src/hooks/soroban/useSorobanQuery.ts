/**
 * useSorobanQuery hook.
 *
 * Wraps Soroban RPC calls in React Query with proper caching,
 * stale time management, and error handling.
 */

import { useQuery, type UseQueryOptions, type QueryKey } from '@tanstack/react-query';

import { parseSorobanError } from '@/services/soroban/errors';

const DEFAULT_SOROBAN_OPTIONS = {
  refetchOnWindowFocus: false,
  staleTime: 30_000,
  retry: 1,
} as const;

/**
 * React Query hook for Soroban contract read calls.
 */
export function useSorobanQuery<TData = unknown>(
  queryKey: QueryKey,
  queryFn: () => Promise<TData>,
  options?: Omit<UseQueryOptions<TData, Error>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<TData, Error>({
    queryKey,
    queryFn: async () => {
      try {
        return await queryFn();
      } catch (error) {
        throw new Error(parseSorobanError(error));
      }
    },
    ...DEFAULT_SOROBAN_OPTIONS,
    ...options,
  });
}
