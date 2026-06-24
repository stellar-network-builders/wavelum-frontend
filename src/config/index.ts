/**
 * Configuration module barrel export.
 *
 * Re-exports all configuration constants and helpers so consumers
 * can import from a single entry point: `@/config`
 */
export { theme, colors, spacing, fontFamily, fontSize, borderRadius, boxShadow, zIndex } from './theme';
export type { LuminaTheme } from './theme';
