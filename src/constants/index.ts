/**
 * Application-wide constants and enums.
 *
 * Import from `@/constants` to keep values consistent across features.
 */

/* ─── Network ────────────────────────────────────────────────────────────── */

export const NETWORKS = {
  TESTNET: 'testnet',
  PUBNET: 'pubnet',
  FUTURENET: 'futurenet',
} as const;

export type Network = (typeof NETWORKS)[keyof typeof NETWORKS];

export const DEFAULT_NETWORK = NETWORKS.TESTNET;

/* ─── Pagination ─────────────────────────────────────────────────────────── */

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

/* ─── Time ───────────────────────────────────────────────────────────────── */

export const MILLISECONDS = {
  SECOND: 1000,
  MINUTE: 60_000,
  HOUR: 3_600_000,
  DAY: 86_400_000,
  WEEK: 604_800_000,
} as const;

/* ─── Vesting ────────────────────────────────────────────────────────────── */

export const VESTING_STATUS = {
  ACTIVE: 'active',
  PAUSED: 'paused',
  COMPLETED: 'completed',
  EXPIRED: 'expired',
  CANCELLED: 'cancelled',
} as const;

export type VestingStatus = (typeof VESTING_STATUS)[keyof typeof VESTING_STATUS];

/* ─── Streaming ──────────────────────────────────────────────────────────── */

export const STREAMING_STATUS = {
  ACTIVE: 'active',
  PAUSED: 'paused',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export type StreamingStatus = (typeof STREAMING_STATUS)[keyof typeof STREAMING_STATUS];

/* ─── Routes ─────────────────────────────────────────────────────────────── */

export const ROUTES = {
  HOME: '/',
  VESTING: '/vesting',
  STREAMING: '/streaming',
  WALLET: '/wallet',
  ADMIN: '/admin',
  DASHBOARD: '/dashboard',
} as const;
