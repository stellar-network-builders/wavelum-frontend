import { z } from 'zod';

export const PUBLIC_ENV_KEYS = [
  'NEXT_PUBLIC_API_URL',
  'NEXT_PUBLIC_SEP10_AUTH_PATH',
  'NEXT_PUBLIC_SOROBAN_RPC_URL',
  'NEXT_PUBLIC_SOROBAN_NETWORK',
  'NEXT_PUBLIC_SENTRY_DSN',
  'NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID',
] as const;

export const REQUIRED_PUBLIC_ENV_KEYS = [
  'NEXT_PUBLIC_API_URL',
  'NEXT_PUBLIC_SOROBAN_RPC_URL',
  'NEXT_PUBLIC_SOROBAN_NETWORK',
] as const;

export type PublicEnvKey = (typeof PUBLIC_ENV_KEYS)[number];
export type PublicEnvSource = Partial<Record<PublicEnvKey, string | undefined>>;

// These values are compiled into browser code. WHATWG URLs also accept
// javascript:, file:, and credentials in userinfo; none is a safe public HTTP
// service endpoint. Validate transport and avoid emitting secrets to clients.
const publicHttpUrl = z
  .string()
  .trim()
  .url()
  .refine((value) => {
    try {
      const url = new URL(value);
      return (
        (url.protocol === 'https:' || url.protocol === 'http:') &&
        url.username.length === 0 &&
        url.password.length === 0
      );
    } catch {
      return false;
    }
  }, 'Must be an HTTP(S) URL without embedded credentials');

const publicApiUrl = publicHttpUrl.refine((value) => {
  const url = new URL(value);
  // An HTTP endpoint prefix must not carry a query/fragment; challenge
  // requests add their own account query and must reach the same API path.
  return !url.search && !url.hash;
}, 'API base URL must not include a query string or fragment');

const publicSentryDsn = z
  .string()
  .trim()
  .url()
  .refine((value) => {
    try {
      const url = new URL(value);
      return (
        (url.protocol === 'https:' || url.protocol === 'http:') &&
        url.username.length > 0 &&
        url.password.length === 0
      );
    } catch {
      return false;
    }
  }, 'Must be an HTTP(S) Sentry DSN with a public key and no private credential');

// SEP-10 challenge+token share one route. A query, fragment, traversal,
// encoded slash or duplicate separator breaks challenge-account binding
// and can make GET and POST resolve different backend paths.
const sep10AuthPath = z.string().trim().refine((value) => {
  if (!/^\/[A-Za-z0-9_.~-]+(?:\/[A-Za-z0-9_.~-]+)*\/?$/.test(value)) return false;
  return value.split('/').every((segment) => segment !== '.' && segment !== '..');
}, 'Must be a canonical slash-prefixed API path without query, fragment or traversal');

export const publicEnvSchema = z.object({
  NEXT_PUBLIC_API_URL: publicApiUrl,
  NEXT_PUBLIC_SEP10_AUTH_PATH: sep10AuthPath.default('/auth/sep10'),
  NEXT_PUBLIC_SOROBAN_RPC_URL: publicHttpUrl,
  NEXT_PUBLIC_SOROBAN_NETWORK: z.enum(['testnet', 'futurenet', 'mainnet']),
  NEXT_PUBLIC_SENTRY_DSN: z.union([publicSentryDsn, z.literal('')]).default(''),
  NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID: z.string().trim().default(''),
});

export type PublicEnv = z.infer<typeof publicEnvSchema>;

const DEFAULT_PUBLIC_ENV: PublicEnv = {
  NEXT_PUBLIC_API_URL: 'http://localhost:4000',
  NEXT_PUBLIC_SEP10_AUTH_PATH: '/auth/sep10',
  NEXT_PUBLIC_SOROBAN_RPC_URL: 'https://soroban-testnet.stellar.org',
  NEXT_PUBLIC_SOROBAN_NETWORK: 'testnet',
  NEXT_PUBLIC_SENTRY_DSN: '',
  NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID: '',
};

function selectPublicEnv(source: PublicEnvSource): PublicEnvSource {
  return {
    NEXT_PUBLIC_API_URL: source.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_SEP10_AUTH_PATH: source.NEXT_PUBLIC_SEP10_AUTH_PATH,
    NEXT_PUBLIC_SOROBAN_RPC_URL: source.NEXT_PUBLIC_SOROBAN_RPC_URL,
    NEXT_PUBLIC_SOROBAN_NETWORK: source.NEXT_PUBLIC_SOROBAN_NETWORK,
    NEXT_PUBLIC_SENTRY_DSN: source.NEXT_PUBLIC_SENTRY_DSN,
    NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID: source.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID,
  };
}

function parsePublicEnv(source: PublicEnvSource): PublicEnv {
  const result = publicEnvSchema.safeParse(source);
  if (result.success) return result.data;

  const missing = REQUIRED_PUBLIC_ENV_KEYS.filter((key) => !source[key]?.trim());
  const invalid = Array.from(
    new Set(
      result.error.issues
        .map((issue) => issue.path[0])
        .filter(
          (key): key is PublicEnvKey =>
            typeof key === 'string' && PUBLIC_ENV_KEYS.includes(key as PublicEnvKey),
        ),
    ),
  ).filter(
    (key) => !missing.includes(key as (typeof REQUIRED_PUBLIC_ENV_KEYS)[number]),
  );

  const details: string[] = [];
  if (missing.length > 0) {
    details.push(`Missing required public environment variables: ${missing.join(', ')}`);
  }
  if (invalid.length > 0) {
    details.push(`Invalid public environment variables: ${invalid.join(', ')}`);
  }

  throw new Error(`[env] ${details.join('; ')}`);
}

/**
 * Strict build/deployment validation. Required variables must be provided.
 * next.config.ts invokes this before Next.js compilation starts.
 */
export function validatePublicEnv(source: PublicEnvSource = process.env): PublicEnv {
  return parsePublicEnv(selectPublicEnv(source));
}

// Keep each public variable as a direct property access so Next.js can inline
// its build-time value into browser bundles. Passing process.env as an object
// would leave client consumers with the local/test fallbacks instead.
function readPublicEnv(): PublicEnvSource {
  return {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_SEP10_AUTH_PATH: process.env.NEXT_PUBLIC_SEP10_AUTH_PATH,
    NEXT_PUBLIC_SOROBAN_RPC_URL: process.env.NEXT_PUBLIC_SOROBAN_RPC_URL,
    NEXT_PUBLIC_SOROBAN_NETWORK: process.env.NEXT_PUBLIC_SOROBAN_NETWORK,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
    NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID,
  };
}

/**
 * Typed application access. Fallbacks keep isolated unit tests and non-Next
 * consumers deterministic; Next.js builds and dev startup pass through
 * validatePublicEnv() first and cannot silently miss a required variable.
 */
export function getPublicEnv(source: PublicEnvSource = readPublicEnv()): PublicEnv {
  const selected = selectPublicEnv(source);
  return parsePublicEnv({
    NEXT_PUBLIC_API_URL:
      selected.NEXT_PUBLIC_API_URL ?? DEFAULT_PUBLIC_ENV.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_SEP10_AUTH_PATH:
      selected.NEXT_PUBLIC_SEP10_AUTH_PATH ?? DEFAULT_PUBLIC_ENV.NEXT_PUBLIC_SEP10_AUTH_PATH,
    NEXT_PUBLIC_SOROBAN_RPC_URL:
      selected.NEXT_PUBLIC_SOROBAN_RPC_URL ?? DEFAULT_PUBLIC_ENV.NEXT_PUBLIC_SOROBAN_RPC_URL,
    NEXT_PUBLIC_SOROBAN_NETWORK:
      selected.NEXT_PUBLIC_SOROBAN_NETWORK ?? DEFAULT_PUBLIC_ENV.NEXT_PUBLIC_SOROBAN_NETWORK,
    NEXT_PUBLIC_SENTRY_DSN:
      selected.NEXT_PUBLIC_SENTRY_DSN ?? DEFAULT_PUBLIC_ENV.NEXT_PUBLIC_SENTRY_DSN,
    NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID:
      selected.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID ??
      DEFAULT_PUBLIC_ENV.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID,
  });
}
