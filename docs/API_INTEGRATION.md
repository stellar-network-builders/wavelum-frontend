# API Integration

This document describes how Lumina Frontend talks to the backend API: the client, the query-key convention, and the mutation hooks.

## Configuration

The API base URL comes from `NEXT_PUBLIC_API_URL` (default `http://localhost:4000`). All requests are made relative to this base.

## API client

A single typed client wraps `fetch`, sets JSON headers, attaches the SEP-10 session token when present, and normalizes errors. Centralizing this keeps call sites small and consistent.

```ts
// services/api-client.ts
const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

/**
 * Perform a typed JSON request against the Lumina backend API.
 *
 * @typeParam T - Expected shape of the response body.
 * @param path - Path relative to the API base URL, e.g. "/vesting/schedules".
 * @param init - Standard fetch options. An auth token is added automatically when available.
 * @returns The parsed JSON response typed as `T`.
 * @throws ApiError when the response status is not in the 2xx range.
 */
export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...authHeader(),
      ...init?.headers,
    },
  });

  if (!res.ok) {
    throw new ApiError(res.status, await safeMessage(res));
  }

  return res.json() as Promise<T>;
}
```

## Server state with React Query

Data from the API is treated as server state and managed with [TanStack Query](https://tanstack.com/query). This gives caching, request deduplication, background refetching, and loading and error states for free. See [STATE_MANAGEMENT.md](STATE_MANAGEMENT.md) for how this is split from client state.

### Query keys

Query keys are structured arrays, ordered from broad to specific. A central factory keeps them consistent and makes invalidation predictable.

```ts
// services/query-keys.ts
export const queryKeys = {
  vesting: {
    all: ["vesting"] as const,
    lists: () => [...queryKeys.vesting.all, "list"] as const,
    list: (account: string) => [...queryKeys.vesting.lists(), account] as const,
    detail: (id: string) => [...queryKeys.vesting.all, "detail", id] as const,
  },
} as const;
```

Conventions:

- The first element is the domain (`"vesting"`).
- Lists and details are separate sub-keys.
- Variables (account, id) come last.
- Invalidate broadly by prefix: invalidating `queryKeys.vesting.all` refetches every vesting query.

### Query hooks

```ts
// hooks/use-vesting-schedules.ts
/**
 * Fetch the vesting schedules for an account.
 *
 * @param account - Stellar account public key (G...).
 * @returns A React Query result with the account's schedules.
 */
export function useVestingSchedules(account: string) {
  return useQuery({
    queryKey: queryKeys.vesting.list(account),
    queryFn: () => apiFetch<VestingSchedule[]>(`/vesting/schedules?account=${account}`),
    enabled: Boolean(account),
  });
}
```

## Mutations

Writes use `useMutation`. After a successful mutation, invalidate the affected query keys so the UI reflects the new state.

```ts
// hooks/use-create-schedule.ts
/**
 * Create a vesting schedule and refresh the account's schedule list on success.
 */
export function useCreateSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateScheduleInput) =>
      apiFetch<VestingSchedule>("/vesting/schedules", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.vesting.list(variables.account),
      });
    },
  });
}
```

## Error handling

- The client throws a typed `ApiError` carrying the HTTP status and a message.
- Components read `error` from the query or mutation result and render a friendly message.
- A `401` response means the session token is missing or expired; trigger the SEP-10 flow again (see [WALLET_INTEGRATION.md](WALLET_INTEGRATION.md)).

## Conventions summary

- One client function (`apiFetch`) for all HTTP calls.
- Query keys come from the central factory, never inline arrays.
- One hook per resource, colocated under `hooks/`.
- Mutations invalidate the smallest set of keys that covers the change.
