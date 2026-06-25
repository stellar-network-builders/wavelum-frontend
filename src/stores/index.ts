/**
 * State management stores barrel export.
 *
 * Client-owned Zustand stores are re-exported here so components can import
 * shared wallet, UI, and preference state from a single stable module.
 */
export { useAuthStore } from './authStore';
export { usePreferencesStore } from './preferencesStore';
export { useUiStore } from './uiStore';
