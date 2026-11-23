'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { queryClient } from '@/src/config/queryClient';
import { registerTokenGetter } from '@/src/services/api/client';
import { useAuthStore } from '@/src/stores/authStore';

type QueryProviderProps = {
  children: React.ReactNode;
};

/**
 * QueryProvider
 *
 * Wires the shared TanStack Query `QueryClient` into the React tree and
 * registers the in-memory auth token getter used by the axios client.
 *
 * State-management contract (see docs/STATE_MANAGEMENT.md):
 * - All *server* state flows through React Query. Components must consume it
 *   via query/mutation hooks (e.g. `useQuery`, `useMutation`, or the domain
 *   hooks in `src/hooks`) rather than calling `fetch`/`axios` directly.
 * - This provider is the single place that connects the QueryClient and the
 *   auth token getter; it intentionally performs no data fetching itself.
 */

/*
 * JWT tokens live in-memory only (the auth store no longer persists them
 * to localStorage so XSS cannot exfiltrate them - see issue #26). The axios
 * client needs a way to read the live token on every request, so we register
 * a tiny getter here at module scope. Doing this at module-import time
 * (rather than inside `useEffect`) guarantees the very first API call fired
 * after QueryProvider is loaded is authenticated - `useEffect` would leave a
 * window where the in-flight requests had no Authorization header.
 *
 * This file is marked `'use client'` so the module body still loads in the
 * server bundle, but the registration is intentionally lazy: the registered
 * function only touches `useAuthStore.getState()` when axios invokes it
 * inside an interceptor, so no `localStorage` access happens at import
 * time on the server. Subsequent `setAuthenticated(...)` updates are picked
 * up by `getState()` automatically without re-registering.
 */
registerTokenGetter(() => useAuthStore.getState().token);

export function QueryProvider({ children }: QueryProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' ? (
        <ReactQueryDevtools initialIsOpen={false} />
      ) : null}
    </QueryClientProvider>
  );
}
