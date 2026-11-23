/**
 * Mutation hooks barrel.
 *
 * State management conventions (see docs/STATE_MANAGEMENT.md and the state
 * management ADR):
 * - Server state is owned by TanStack Query. All mutations live here as hooks
 *   and must invalidate every affected query key on success so cached server
 *   state stays consistent.
 * - Feature code must NOT call the API client (or `fetch`) directly. Use these
 *   mutation hooks (and the corresponding query hooks) instead.
 * - Client state belongs in Zustand stores; form state in React Hook Form + Zod;
 *   URL state via next/navigation `useSearchParams`; local component state via
 *   `useState`/`useReducer`.
 *
 * Every mutation hook in this directory must be re-exported from this barrel.
 */
export { useClaimVesting } from './useClaimVesting';
export { useCreateVault } from './useCreateVault';