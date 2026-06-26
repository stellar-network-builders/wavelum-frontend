/**
 * Admin Feature Module
 *
 * Everything specific to the admin panel: user/KYC management and vault
 * administration.
 *
 * Internal layout:
 * - `components/` — feature UI
 * - `hooks/`      — data fetching & feature state
 * - `types/`      — feature-local types
 *
 * Only what's re-exported below is the feature's public API. Import it from
 * `@/features/admin`; reach into internal files only from within the feature.
 */
export * from './components';
export * from './hooks';
export * from './types';
