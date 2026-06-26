/**
 * Centralized Axios-based API client for the lumina-backend.
 *
 * This is the single HTTP client for the app. Feature code never calls
 * `fetch`/`axios` directly — it goes through the typed service modules
 * (`vestingService`, `authService`, …) which are built on the `http` helper
 * exported here.
 *
 * Features:
 * - Pre-configured base URL from `NEXT_PUBLIC_API_URL`
 * - JWT token injection via request interceptor (registered from the auth store)
 * - Unified error handling: every rejection is normalized to {@link ApiError}
 * - Automatic 401 → clear auth + redirect to wallet connection (registered handler)
 * - 403 → "insufficient permissions" toast (registered handler)
 * - 429 → exponential backoff retry honoring `Retry-After`
 * - 5xx → console log in dev + generic error toast
 * - Request/response logging in development
 * - Native `AbortSignal` support via Axios `config.signal` for request cancellation
 */

import axios, {
  type AxiosError,
  type InternalAxiosRequestConfig,
  type AxiosRequestConfig,
} from 'axios';

import { ApiError } from '@/src/lib/errors';
import type { ApiErrorBody } from '@/src/types/api';

/* ─── Constants ──────────────────────────────────────────────────────────── */

const DEFAULT_BASE_URL = 'http://localhost:4000';
const DEFAULT_TIMEOUT = 30_000; // 30s
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

/* ─── Axios Instance ─────────────────────────────────────────────────────── */

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_BASE_URL,
  timeout: DEFAULT_TIMEOUT,
  withCredentials: false, // JWT in Authorization header, not cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

/* ─── Pluggable integrations ─────────────────────────────────────────────── */
/*
 * The client must not import the auth store, toast context, or router directly
 * — that would couple this transport layer to React and create import cycles.
 * Instead consumers register callbacks at runtime (see `ApiClientProvider`).
 */

type ToastVariant = 'success' | 'error' | 'warning' | 'info';
type ToastPayload = { title: string; description?: string; variant: ToastVariant };

let registeredTokenGetter: (() => string | null) | null = null;
let onUnauthorized: (() => void) | null = null;
let toastHandler: ((toast: ToastPayload) => void) | null = null;

/**
 * Register a token getter (e.g. from the Zustand auth store). Tried first,
 * before the localStorage fallback, so token injection stays current.
 */
export function registerTokenGetter(getter: () => string | null) {
  registeredTokenGetter = getter;
}

/**
 * Register a callback invoked on a 401 response — typically clears the auth
 * store and navigates the user to wallet connection.
 */
export function registerUnauthorizedHandler(handler: () => void) {
  onUnauthorized = handler;
}

/**
 * Register a toast emitter so the response interceptor can surface 403/5xx
 * errors through the app's `<ToastProvider>`.
 */
export function registerToastHandler(handler: (toast: ToastPayload) => void) {
  toastHandler = handler;
}

function emitToast(toast: ToastPayload) {
  toastHandler?.(toast);
}

/* ─── Token Management ───────────────────────────────────────────────────── */

/**
 * Resolve the current JWT. Prefers the registered getter (most current) and
 * falls back to the persisted auth token in localStorage for SSR/hydration
 * safety before the store initializes.
 */
function getToken(): string | null {
  if (registeredTokenGetter) {
    const token = registeredTokenGetter();
    if (token) return token;
  }

  if (typeof window !== 'undefined') {
    try {
      // Mirrors the zustand `persist` key in `authStore` ("lumina-auth").
      const raw = localStorage.getItem('lumina-auth');
      if (raw) {
        const parsed = JSON.parse(raw) as { state?: { token?: string | null } };
        if (parsed.state?.token) return parsed.state.token;
      }
    } catch {
      // localStorage unavailable or corrupted — ignore.
    }
  }

  return null;
}

/* ─── Request Interceptor ────────────────────────────────────────────────── */

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(`[API] ${config.method?.toUpperCase()} ${config.baseURL ?? ''}${config.url ?? ''}`);
    }

    return config;
  },
  (error) => Promise.reject(error),
);

/* ─── Response Interceptor ───────────────────────────────────────────────── */

type RetryableConfig = InternalAxiosRequestConfig & { _retryCount?: number };

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorBody>) => {
    const { response, config } = error;

    // Network error / timeout / cancellation — no response received.
    if (!response) {
      if (axios.isCancel(error)) {
        return Promise.reject(error); // React Query handles cancellation itself.
      }
      if (process.env.NODE_ENV === 'development') {
        console.error('[API] Network error:', error.message);
      }
      return Promise.reject(
        new ApiError(error.message || 'Network request failed', 'NETWORK_ERROR', 0),
      );
    }

    const { status } = response;

    switch (status) {
      case 401: {
        onUnauthorized?.();
        break;
      }
      case 403: {
        emitToast({
          title: 'Insufficient permissions',
          description: 'You do not have access to this resource.',
          variant: 'error',
        });
        break;
      }
      case 429: {
        const retryConfig = config as RetryableConfig;
        const retryCount = retryConfig._retryCount ?? 0;

        if (retryCount < MAX_RETRIES) {
          const retryAfterHeader = Number(response.headers['retry-after']);
          const backoff = RETRY_DELAY_MS * 2 ** retryCount;
          const delay = Number.isFinite(retryAfterHeader) && retryAfterHeader > 0
            ? retryAfterHeader * 1000
            : backoff;

          retryConfig._retryCount = retryCount + 1;

          if (process.env.NODE_ENV === 'development') {
            console.log(`[API] Rate limited — retrying in ${delay}ms (attempt ${retryCount + 1}/${MAX_RETRIES})`);
          }

          await new Promise((resolve) => setTimeout(resolve, delay));
          return apiClient(retryConfig);
        }
        break;
      }
      case 500:
      case 502:
      case 503:
      case 504: {
        if (process.env.NODE_ENV === 'development') {
          console.error('[API] Server error:', response.data);
        }
        emitToast({
          title: 'Server error',
          description: 'An unexpected error occurred. Please try again.',
          variant: 'error',
        });
        break;
      }
    }

    return Promise.reject(toApiError(error));
  },
);

/* ─── Error normalization ────────────────────────────────────────────────── */

/**
 * Convert an Axios error into the app's {@link ApiError} so downstream consumers
 * (React Query, `useErrorToast`) get a uniform, code-keyed error shape.
 */
function toApiError(error: AxiosError<ApiErrorBody>): ApiError {
  const status = error.response?.status ?? 0;
  const body = error.response?.data;
  const message = body?.message ?? error.message ?? 'Request failed';
  const code = body?.code ?? String(status);
  const retryAfterHeader = Number(error.response?.headers?.['retry-after']);
  const retryAfter = Number.isFinite(retryAfterHeader) && retryAfterHeader > 0 ? retryAfterHeader : undefined;

  return new ApiError(message, code, status, error.config?.url, retryAfter);
}

/* ─── Typed request helpers ──────────────────────────────────────────────── */
/*
 * Thin wrappers that unwrap `response.data` so service modules read cleanly:
 *
 *     const vault = await http.get<Vault>(`/vaults/${id}`, { signal });
 */

export const http = {
  get: <T>(url: string, config?: AxiosRequestConfig) =>
    apiClient.get<T>(url, config).then((r) => r.data),
  post: <T>(url: string, body?: unknown, config?: AxiosRequestConfig) =>
    apiClient.post<T>(url, body, config).then((r) => r.data),
  put: <T>(url: string, body?: unknown, config?: AxiosRequestConfig) =>
    apiClient.put<T>(url, body, config).then((r) => r.data),
  patch: <T>(url: string, body?: unknown, config?: AxiosRequestConfig) =>
    apiClient.patch<T>(url, body, config).then((r) => r.data),
  delete: <T>(url: string, config?: AxiosRequestConfig) =>
    apiClient.delete<T>(url, config).then((r) => r.data),
};
