/**
 * Shared TypeScript type definitions and interfaces barrel export.
 *
 * Feature-specific types live in their respective `types/` subdirectories.
 * Place shared/cross-cutting types here.
 *
 * @module
 */

// Re-export next-intl augmented types
// (declaration file is loaded automatically by TypeScript — no explicit re-export needed)
//
// Cross-cutting types (Network, VestingStatus, StreamingStatus) are defined
// in and re-exported from @/constants for single-sourcing.
