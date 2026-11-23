# ADR 0001: State Management Patterns

- **Status:** Accepted
- **Date:** 2025-01-01
- **Issue:** [#70](https://github.com/example/repo/issues/70)
- **Related:** [docs/STATE_MANAGEMENT.md](../STATE_MANAGEMENT.md)

## Context

The codebase currently uses several overlapping tools for managing state:

- **Zustand** stores for shared client state
- **TanStack Query** for server state and caching
- **Local component state** via `useState` / `useReducer`
- **React Hook Form + Zod** for form state and validation
- **URL state** via `next/navigation` (`useSearchParams`, `useRouter`)
- Ad-hoc **direct `fetch` / `axios` calls** scattered across components and hooks

Because there is no enforced convention, contributors make inconsistent choices about where state lives and how it is fetched. This leads to:

- Duplicated data-fetching logic and inconsistent caching behavior
- Prop drilling through many component layers instead of using context or a store
- Direct network calls embedded in components, bypassing hooks and making testing and error handling inconsistent
- Confusion during code review about which pattern is "correct"

We need a documented, enforceable decision so that state management choices are predictable and reviewable.

## Decision

We adopt a **five-category split** for state management, as documented in [docs/STATE_MANAGEMENT.md](../STATE_MANAGEMENT.md):

| Category | Tool | Use for |
| --- | --- | --- |
| **Server state** | TanStack Query | Data owned by the backend: fetching, caching, mutations, invalidation |
| **Client state** | Zustand | Shared, app-wide client state (UI preferences, session-scoped data) |
| **Form state** | React Hook Form + Zod | Form values, validation, submission lifecycle |
| **URL state** | `next/navigation` (`useSearchParams`) | State that should be shareable/bookmarkable (filters, pagination, tabs) |
| **Component state** | `useState` / `useReducer` | Ephemeral, local UI state confined to a single component or small subtree |

In addition, we enforce two hard rules:

1. **No direct `fetch` or `axios` calls outside `src/services/**`.** All network access must go through the service layer and be consumed via TanStack Query hooks. Components and hooks must not call `fetch`/`axios` directly.
2. **No prop drilling beyond 3 levels.** If a prop must be threaded through more than three component layers, use React Context (for scoped, subtree state) or a Zustand store (for shared client state) instead.

These rules are enforced via ESLint (`no-restricted-globals` / `no-restricted-imports` for `fetch`/`axios`, and a custom rule for prop drilling depth) and gated in CI.

## Consequences

### Positive

- A single, documented decision tree removes ambiguity about where state should live.
- Consistent data fetching and caching through TanStack Query improves performance and reduces bugs.
- Direct network calls are centralized in `src/services/**`, improving testability, error handling, and observability.
- Eliminating prop drilling improves component composability and reduces churn when refactoring.
- ESLint rules and the CI lint gate catch violations automatically, keeping the codebase consistent over time.

### Negative / Costs

- **Refactors required:** existing direct `fetch`/`axios` calls must be migrated into `src/services/**` and consumed via hooks. Existing prop-drilling chains beyond three levels must be refactored to context or stores.
- Contributors must learn the decision tree and the ESLint rules; violations will fail CI.
- Some legitimate edge cases (e.g., one-off calls in scripts or tests) require explicit ESLint disable comments with justification.

### Enforcement

- ESLint rules are added for state management patterns (no direct `fetch`/`axios` outside `src/services/**`, no prop drilling beyond 3 levels).
- The CI lint job runs ESLint and fails the build on violations.
- This ADR and [docs/STATE_MANAGEMENT.md](../STATE_MANAGEMENT.md) are the source of truth for state management decisions.

## References

- [docs/STATE_MANAGEMENT.md](../STATE_MANAGEMENT.md) — the state management decision tree and usage guidance
- Issue [#70](https://github.com/example/repo/issues/70) — Standardize state management patterns and enforce with ESLint