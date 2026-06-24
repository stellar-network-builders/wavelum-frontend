/**
 * Lumina Design Token System
 *
 * Extends Tailwind CSS v4 with project-specific tokens.
 * These values are meant to be consumed via Tailwind's `@theme` directive
 * in `app/globals.css` and are also exported as JS constants for
 * programmatic use (e.g., chart libraries, inline styles).
 */

/* ─── Colour Palette ─────────────────────────────────────────────────────── */

export const colors = {
  lumina: {
    50: '#f0f4ff',
    100: '#dbe4ff',
    200: '#bac8ff',
    300: '#91a7ff',
    400: '#748ffc',
    500: '#5c7cfa',
    600: '#4c6ef5',
    700: '#4263eb',
    800: '#3b5bdb',
    900: '#364fc7',
    950: '#2b3fa0',
  },
  stellar: {
    blue: '#1e3a5f',
    cyan: '#00bcd4',
    purple: '#7c3aed',
  },
  semantic: {
    success: '#16a34a',
    warning: '#d97706',
    error: '#dc2626',
    info: '#2563eb',
  },
  surface: {
    light: '#ffffff',
    lightSecondary: '#f8fafc',
    lightTertiary: '#f1f5f9',
    dark: '#0a0a0a',
    darkSecondary: '#18181b',
    darkTertiary: '#27272a',
  },
} as const;

/* ─── Spacing Scale (overrides Tailwind defaults) ────────────────────────── */

export const spacing = {
  'page-x': '1.5rem' /* 24px — default horizontal page padding */,
  'page-y': '2rem' /* 32px — default vertical page padding */,
  'section': '2.5rem' /* 40px — gap between sections */,
  'card-gap': '1.25rem' /* 20px — gap inside cards */,
} as const;

/* ─── Typography ─────────────────────────────────────────────────────────── */

export const fontFamily = {
  sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
  mono: ['var(--font-geist-mono)', 'monospace'],
  display: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
} as const;

export const fontSize = {
  'display-lg': ['3.25rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }],
  'display': ['2.5rem', { lineHeight: '1.15', letterSpacing: '-0.02em', fontWeight: '700' }],
  'title-lg': ['1.875rem', { lineHeight: '1.25', letterSpacing: '-0.015em', fontWeight: '600' }],
  'title': ['1.5rem', { lineHeight: '1.3', letterSpacing: '-0.01em', fontWeight: '600' }],
  'body-lg': ['1.125rem', { lineHeight: '1.6' }],
  'body': ['1rem', { lineHeight: '1.6' }],
  'body-sm': ['0.875rem', { lineHeight: '1.5' }],
  'caption': ['0.75rem', { lineHeight: '1.4' }],
} as const satisfies Record<string, string | [string, Record<string, string | number>]>;

/* ─── Border Radius ──────────────────────────────────────────────────────── */

export const borderRadius = {
  'xs': '0.25rem',
  'sm': '0.375rem',
  'md': '0.5rem',
  'lg': '0.75rem',
  'xl': '1rem',
  '2xl': '1.5rem',
  'full': '9999px',
} as const;

/* ─── Shadows ────────────────────────────────────────────────────────────── */

export const boxShadow = {
  'card': '0 1px 3px 0 rgb(0 0 0 / 0.04), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
  'card-hover': '0 4px 6px -1px rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
  'elevated': '0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.04)',
  'modal': '0 20px 25px -5px rgb(0 0 0 / 0.12), 0 8px 10px -6px rgb(0 0 0 / 0.06)',
} as const;

/* ─── Animation ──────────────────────────────────────────────────────────── */

export const transitionDuration = {
  'fast': '150ms',
  'normal': '200ms',
  'slow': '300ms',
} as const;

export const transitionTimingFunction = {
  'ease-out': 'cubic-bezier(0.16, 1, 0.3, 1)',
  'ease-in-out': 'cubic-bezier(0.65, 0, 0.35, 1)',
} as const;

/* ─── Z-index Scale ──────────────────────────────────────────────────────── */

export const zIndex = {
  dropdown: '50',
  sticky: '100',
  modal: '200',
  toast: '300',
  tooltip: '400',
} as const;

/**
 * Full theme object — useful for programmatic access or
 * passing to third-party libraries that accept a theme config.
 */
export const theme = {
  colors,
  spacing,
  fontFamily,
  fontSize,
  borderRadius,
  boxShadow,
  transitionDuration,
  transitionTimingFunction,
  zIndex,
} as const;

export type LuminaTheme = typeof theme;
