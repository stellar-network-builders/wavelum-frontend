# API Integration

This document describes how Lumina Frontend talks to the backend API: the Axios client, the typed service modules, the query-key convention, and the React Query hooks.

## Configuration

The API base URL comes from `NEXT_PUBLIC_API_URL` (default `http://localhost:4000`). All requests are made relative to this base.

## Architecture

```
React component
  └─ React Query hook        (src/hooks/queries, src/hooks/mutations)
       └─ service module      (src/services/{vesting,auth,portfolio,admin}Service.ts)
            └─ http helper     (src/services/api/client.ts)
                 └─ Axios apiClient  (interceptors: auth, errors, retry)
```

Feature code never calls `fetch`/`axios` directly. It goes through a typed service module, which is built on the shared `http` helper, which wraps the single pre-configured Axios instance.

## API client

`src/services/api/client.ts` exports a single Axios instance (`apiClient`) plus a terse typed `http` helper. The instance is configured with the base URL, a 30s timeout, and `withCredentials: false` (the JWT lives in the `Authorization` header, not cookies).

### Request interceptor

Injects `Authorization: Bearer <token>`. The token is read from a getter registered at runtime by `ApiClientProvider` (which reads the Zustand `authStore`), falling back to the persisted `lumina-auth` localStorage entry for SSR/hydration safety. Requests are logged in development.

### Response interceptor

| Status | Behavior |
| ------ | -------- |
| `401`  | Runs the registered unauthorized handler — clears auth and opens the connect-wallet modal |
| `403`  | Shows an "Insufficient permissions" error toast |
| `429`  | Exponential backoff retry (honoring `Retry-After`), up to 3 attempts |
| `5xx`  | Logs in dev, shows a generic error toast |

Every rejection is normalized to the app's typed `ApiError` (`src/lib/errors.ts`), carrying the HTTP status, a machine-readable code, the endpoint, and an optional `retryAfter`. Components surface it via `useErrorToast`.

### Runtime registration

`apiClient` must not import React, the store, or the router (that would couple the transport layer to the UI and risk import cycles). Instead, `src/providers/ApiClientProvider.tsx` — mounted inside `<ToastProvider>` — registers the token getter, the 401 handler, and the toast emitter on mount.

## Typed service modules

One module per backend domain, each function accepting an optional `AbortSignal`:

- `vestingService` — `getVaults`, `getVaultById`, `getSubSchedules`, `getClaims`, `claimVesting`, `createVault`
- `authService` — `getSep10Challenge`, `submitSep10Response`, `refreshToken`
- `portfolioService` — `getTokenBalances`, `getPortfolioSummary`
- `adminService` — `getUsers`, `approveKyc`, `pauseVault`

```ts
// src/services/vestingService.ts
export const vestingService = {
  getVaults: (params: PaginationParams = {}, signal?: AbortSignal) =>
    http.get<PaginatedResponse<Vault>>('/vaults', {
      params: { page: params.page, pageSize: params.pageSize },
      signal,
    }),
  // ...
};
```

## Generated types

Backend response shapes are typed from the backend's OpenAPI document via [`openapi-typescript`](https://github.com/drwpow/openapi-typescript):

```bash
npm run generate:types   # openapi-typescript $NEXT_PUBLIC_API_URL/openapi.json --output src/types/api.ts
```

`src/types/api.ts` holds a checked-in copy (a `paths` interface plus a `components.schemas` namespace) used as a fallback in offline/CI environments. Run the script against a live backend to refresh it; consumers switch over with no code changes.

## Server state with React Query

Data from the API is treated as server state and managed with [TanStack Query](https://tanstack.com/query). This gives caching, request deduplication, background refetching, and loading and error states for free. See [STATE_MANAGEMENT.md](STATE_MANAGEMENT.md) for how this is split from client state.

### Query keys

Query keys are structured arrays, ordered from broad to specific. A central factory (`src/services/queryKeys.ts`) keeps them consistent and makes invalidation predictable.

```ts
export const queryKeys = {
  vaults: {
    all: ['vaults'] as const,
    lists: () => [...queryKeys.vaults.all, 'list'] as const,
    list: (params: PaginationParams = {}) => [...queryKeys.vaults.lists(), params] as const,
    detail: (vaultId: string) => [...queryKeys.vaults.all, 'detail', vaultId] as const,
  },
  // vestings, claims, portfolio, admin ...
} as const;
```

Conventions:

- The first element is the domain (`"vaults"`).
- Lists and details are separate sub-keys.
- Variables (params, id) come last.
- Invalidate broadly by prefix: invalidating `queryKeys.vaults.all` refetches every vault query.

### Query hooks

Hooks forward React Query's `signal` to the service for request cancellation.

```ts
// src/hooks/queries/useVaults.ts
export function useVaults(params: PaginationParams = {}) {
  return useQuery({
    queryKey: queryKeys.vaults.list(params),
    queryFn: ({ signal }) => vestingService.getVaults(params, signal),
  });
}
```

## Mutations

Writes use `useMutation`. After a successful mutation, invalidate the affected query keys so the UI reflects the new state.

```ts
// src/hooks/mutations/useCreateVault.ts
export function useCreateVault(options: UseCreateVaultOptions = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateVaultInput) => vestingService.createVault(input),
    onSuccess: (vault) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vaults.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.portfolio.all });
      options.onSuccess?.(vault);
    },
  });
}
```

## Error handling

- The client normalizes every failure to a typed `ApiError` carrying the HTTP status, a code, and the endpoint.
- Components read `error` from the query or mutation result and render a friendly message, or rely on `useErrorToast` for automatic toasts.
- A `401` response means the session token is missing or expired; the interceptor clears auth and reopens wallet connection to trigger the SEP-10 flow again (see [WALLET_INTEGRATION.md](WALLET_INTEGRATION.md)).

## Conventions summary

- One Axios client (`apiClient`) and one `http` helper for all HTTP calls.
- One service module per backend domain; functions accept an `AbortSignal`.
- Query keys come from the central factory, never inline arrays.
- One hook per resource, colocated under `hooks/`; hooks forward the cancellation `signal`.
- Mutations invalidate the smallest set of keys that covers the change.
- Backend types are generated from OpenAPI, never hand-maintained.
```
