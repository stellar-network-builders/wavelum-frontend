/**
 * Centralized Axios-based API client for the lumina-backend.
 */

import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';

const DEFAULT_TIMEOUT = 30_000;
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api',
  timeout: DEFAULT_TIMEOUT,
  withCredentials: false,
  headers: { 'Content-Type': 'application/json' },
});

let registeredTokenGetter: (() => string | null) | null = null;

export function registerTokenGetter(getter: () => string | null) {
  registeredTokenGetter = getter;
}

function getToken(): string | null {
  if (registeredTokenGetter) {
    const token = registeredTokenGetter();
    if (token) return token;
  }
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('lumina-auth-token');
      if (stored) {
        const parsed = JSON.parse(stored) as { token: string; expiresAt: number };
        if (parsed.expiresAt > Date.now()) return parsed.token;
      }
    } catch { /* ignore */ }
  }
  return null;
}

let onUnauthorized: (() => void) | null = null;

export function registerUnauthorizedHandler(handler: () => void) {
  onUnauthorized = handler;
}

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    }
    return config;
  },
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const { response, config } = error;
    if (!response) {
      if (process.env.NODE_ENV === 'development') console.error('[API] Network error:', error.message);
      return Promise.reject(error);
    }
    const { status } = response;
    switch (status) {
      case 401: if (onUnauthorized) onUnauthorized(); break;
      case 403: case 500: case 502: case 503: case 504: {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('toast', {
            detail: { title: status === 403 ? 'Insufficient permissions' : 'Server error', description: 'An error occurred. Please try again.', variant: 'error' },
          }));
        }
        break;
      }
      case 429: {
        const retryCount = ((config as InternalAxiosRequestConfig & { _retryCount?: number })._retryCount ?? 0);
        if (retryCount < MAX_RETRIES) {
          const delay = RETRY_DELAY_MS * Math.pow(2, retryCount);
          (config as InternalAxiosRequestConfig & { _retryCount?: number })._retryCount = retryCount + 1;
          await new Promise((resolve) => setTimeout(resolve, delay));
          return apiClient(config!);
        }
        break;
      }
    }
    return Promise.reject(error);
  },
);
