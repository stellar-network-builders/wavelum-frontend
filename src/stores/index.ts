/**
 * State management stores barrel export.
 *
 * Client-owned Zustand stores are re-exported here so components can import
 * shared wallet, UI, and preference state from a single stable module.
 *
 * IMPORTANT: These stores hold client-only state (auth session, UI toggles,
 * user preferences). They must never cache server data — server state belongs
 * in TanStack Query per docs/STATE_MANAGEMENT.md. This module is the canonical
 * import surface referenced by the state management documentation.
 */
export { useAuthStore } from './authStore';
export { usePreferencesStore } from './preferencesStore';
export { useUiStore } from './uiStore';