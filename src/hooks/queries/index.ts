/**
 * Server-state query hooks (TanStack Query).
 *
 * All server state MUST be read through these hooks — never via direct
 * `fetch`/`axios` calls in components or other modules. This is enforced by
 * ESLint (see `no-restricted-globals` / `no-restricted-imports` rules) and
 * documented in `docs/STATE_MANAGEMENT.md` and the state management ADR.
 *
 * When adding a new server-state query, create a hook in this directory and
 * export it from this barrel so consumers have a single import surface.
 */
export { useClaims } from './useClaims';
export { usePortfolio } from './usePortfolio';
export { useVaults } from './useVaults';
export { useVestings } from './useVestings';