import { useAuthStore } from '@/src/stores/authStore';

const DEFAULT_API_URL = 'http://localhost:4000';

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

type QueryValue = string | number | boolean | null | undefined;

export function toQueryString(params: Record<string, QueryValue>) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, String(value));
    }
  });

  const queryString = searchParams.toString();

  return queryString ? `?${queryString}` : '';
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    headers: buildHeaders(init.headers),
  });

  if (!response.ok) {
    throw new ApiError(response.status, await readErrorMessage(response));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

function getApiBaseUrl() {
  return process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_URL;
}

function buildHeaders(headers?: HeadersInit) {
  const token = useAuthStore.getState().token;
  const requestHeaders = new Headers(headers);

  if (!requestHeaders.has('Content-Type')) {
    requestHeaders.set('Content-Type', 'application/json');
  }

  if (token) {
    requestHeaders.set('Authorization', `Bearer ${token}`);
  }

  return requestHeaders;
}

async function readErrorMessage(response: Response) {
  try {
    const body = (await response.json()) as { message?: string; error?: string };

    return body.message ?? body.error ?? response.statusText;
  } catch {
    return response.statusText;
  }
}
