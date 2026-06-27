/**
 * Wallet Feature Module
 *
 * Everything specific to wallet connection and Stellar account authentication
 * (Freighter / Wallet SDK integration, SEP-10).
 *
 * Internal layout:
 * - `components/` — feature UI
 * - `hooks/`      — connection & signing hooks
 * - `types/`      — feature-local types
 *
 * Only what's re-exported below is the feature's public API. Import it from
 * `@/features/wallet`; reach into internal files only from within the feature.
 */
export * from './components';
export * from './hooks';
export * from './types';
