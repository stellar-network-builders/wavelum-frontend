/**
 * Streaming Feature Module
 *
 * Everything specific to token streaming: viewing live streams, stream rates,
 * and stream lifecycle actions.
 *
 * Internal layout:
 * - `components/` — feature UI
 * - `hooks/`      — data fetching & feature state
 * - `types/`      — feature-local types
 *
 * Only what's re-exported below is the feature's public API. Import it from
 * `@/features/streaming`; reach into internal files only from within the feature.
 */
export * from './components';
export * from './hooks';
export * from './types';
