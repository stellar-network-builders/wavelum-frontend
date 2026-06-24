/**
 * Centralized Axios-based API client for the lumina-backend.
 *
 * Features:
 * - Pre-configured base URL from `NEXT_PUBLIC_API_URL`
 * - JWT token injection via request interceptor
 * - Unified error handling with toast notifications
 * - Automatic 401 redirect to wallet connection
 * - Exponential backoff retry on 429 rate limits
 * - Request/response logging in development
 */

import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';

/* ─── Constants ──────────────────────────────────────────────────────────── */

const DEFAULT_TIMEOUT = 30_000; // 30s
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

/* ─── Axios Instance ─────────────────────────────────────────────────────── */

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api',
  timeout: DEFAULT_TIMEOUT,
  withCredentials: false, // JWT in Authorization header, not cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

/* ─── Token Management ───────────────────────────────────────────────────── */

/**
 * Get the current JWT token. Falls back to localStorage first,
 * then delegates to a registered getter (e.g. from Zustand auth store).
 * This ensures token injection works even before the auth store initializes.
 */
function getToken(): string | null {
  // 1. Try the registered getter (most current, from auth store)
  if (registeredTokenGetter) {
    const token = registeredTokenGetter();
    if (token) return token;
  }
  // 2. Fall back to localStorage for SSR/hydration safety
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('lumina-auth-token');
      if (stored) {
        const parsed = JSON.parse(stored) as { token: string; expiresAt: number };
        if (parsed.expiresAt > Date.now()) {
          return parsed.token;
        }
      }
    } catch {
      // localStorage unavailable or corrupted — ignore
    }
  }
  return null;
}

let registeredTokenGetter: (() => string | null) | null = null;

/**
 * Register a custom token getter (e.g. from a Zustand auth store).
 * The registered getter is tried first before falling back to localStorage.
 */
export function registerTokenGetter(getter: () => string | null) {
  registeredTokenGetter = getter;
}

/* ─── Navigation callback (for 401 redirects) ────────────────────────────── */

let onUnauthorized: (() => void) | null = null;

/**
 * Register a callback to be invoked when a 401 response is received
 * (e.g. clear auth store and navigate to wallet connection).
 */
export function registerUnauthorizedHandler(handler: () => void) {
  onUnauthorized = handler;
}

/* ─── Request Interceptor ────────────────────────────────────────────────── */

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Inject JWT token
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Development logging
    if (process.env.NODE_ENV === 'development') {
      console.log(
        `[API] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`,
      );
    }

    return config;
  },
  (error) => Promise.reject(error),
);

/* ─── Response Interceptor ───────────────────────────────────────────────── */

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const { response, config } = error;

    if (!response) {
      // Network error — no response received
      if (process.env.NODE_ENV === 'development') {
        console.error('[API] Network error:', error.message);
      }
      return Promise.reject(error);
    }

    const { status } = response;

    switch (status) {
      case 401: {
        // Clear auth state and redirect to wallet connection
        if (onUnauthorized) {
          onUnauthorized();
        }
        break;
      }
      case 403: {
        // Permission denied — dispatch toast notification
        if (typeof window !== 'undefined') {
          const event = new CustomEvent('toast', {
            detail: {
              title: 'Insufficient permissions',
              description: 'You do not have access to this resource.',
              variant: 'error',
            },
          });
          window.dispatchEvent(event);
        }
        break;
      }
      case 429: {
        // Rate limit — exponential backoff retry
        const retryCount = (config as InternalAxiosRequestConfig & { _retryCount?: number })._retryCount ?? 0;

        if (retryCount < MAX_RETRIES) {
          const delay = RETRY_DELAY_MS * Math.pow(2, retryCount);
          (config as InternalAxiosRequestConfig & { _retryCount?: number })._retryCount = retryCount + 1;

          if (process.env.NODE_ENV === 'development') {
            console.log(`[API] Rate limited — retrying in ${delay}ms (attempt ${retryCount + 1}/${MAX_RETRIES})`);
          }

          await new Promise((resolve) => setTimeout(resolve, delay));
          return apiClient(config!);
        }
        break;
      }
      case 500:
      case 502:
      case 503:
      case 504: {
        // Server error — log in dev, show generic toast in production
        if (process.env.NODE_ENV === 'development') {
          console.error('[API] Server error:', response.data);
        }
        if (typeof window !== 'undefined') {
          const event = new CustomEvent('toast', {
            detail: {
              title: 'Server error',
              description: 'An unexpected error occurred. Please try again.',
              variant: 'error',
            },
          });
          window.dispatchEvent(event);
        }
        break;
      }
    }

    return Promise.reject(error);
  },
);
