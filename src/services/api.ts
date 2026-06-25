/**
 * Base API client for external service integrations.
 *
 * Provides a thin fetch wrapper with error handling, request/response
 * interceptors, and Soroban RPC helpers. Feature modules import from
 * here rather than calling fetch directly.
 */

/* ─── Types ──────────────────────────────────────────────────────────────── */

export interface ApiClientConfig {
  baseUrl: string;
  headers?: Record<string, string>;
  timeout?: number;
}

export interface ApiResponse<T = unknown> {
  data: T | null;
  error: ApiError | null;
  status: number;
  ok: boolean;
}

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

/* ─── Client ─────────────────────────────────────────────────────────────── */

export class ApiClient {
  private readonly config: Required<ApiClientConfig>;

  constructor(config: ApiClientConfig) {
    this.config = {
      headers: { 'Content-Type': 'application/json' },
      timeout: 15_000,
      ...config,
    };
  }

  async get<T = unknown>(path: string, signal?: AbortSignal): Promise<ApiResponse<T>> {
    return this.request<T>('GET', path, undefined, signal);
  }

  async post<T = unknown>(path: string, body?: unknown, signal?: AbortSignal): Promise<ApiResponse<T>> {
    return this.request<T>('POST', path, body, signal);
  }

  async put<T = unknown>(path: string, body?: unknown, signal?: AbortSignal): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', path, body, signal);
  }

  async delete<T = unknown>(path: string, signal?: AbortSignal): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', path, undefined, signal);
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
    signal?: AbortSignal,
  ): Promise<ApiResponse<T>> {
    const url = `${this.config.baseUrl}${path}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    // Combine external signal with timeout signal
    const combinedSignal = signal
      ? combineAbortSignals(signal, controller.signal)
      : controller.signal;

    try {
      const response = await fetch(url, {
        method,
        headers: this.config.headers,
        body: body ? JSON.stringify(body) : undefined,
        signal: combinedSignal,
      });

      clearTimeout(timeoutId);

      let data: T | null = null;
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        data = (await response.json()) as T;
      }

      if (!response.ok) {
        return {
          data: null,
          error: {
            code: `HTTP_${response.status}`,
            message: response.statusText || `Request failed with status ${response.status}`,
          },
          status: response.status,
          ok: false,
        };
      }

      return { data, error: null, status: response.status, ok: true };
    } catch (err) {
      clearTimeout(timeoutId);

      if (err instanceof DOMException && err.name === 'AbortError') {
        return {
          data: null,
          error: { code: 'TIMEOUT', message: 'Request timed out' },
          status: 0,
          ok: false,
        };
      }

      const message = err instanceof Error ? err.message : 'Unknown network error';
      return {
        data: null,
        error: { code: 'NETWORK_ERROR', message },
        status: 0,
        ok: false,
      };
    }
  }
}

/* ─── Helpers ────────────────────────────────────────────────────────────── */

/**
 * Combines two AbortSignals into one — aborts if *either* fires.
 */
function combineAbortSignals(...signals: AbortSignal[]): AbortSignal {
  const controller = new AbortController();

  for (const signal of signals) {
    if (signal.aborted) {
      controller.abort(signal.reason);
      return controller.signal;
    }
    signal.addEventListener('abort', () => controller.abort(signal.reason), { once: true });
  }

  return controller.signal;
}

/**
 * Creates a pre-configured API client for Soroban RPC.
 *
 * @param rpcUrl — Soroban RPC endpoint (e.g. `https://soroban-testnet.stellar.org`)
 */
export function createSorobanClient(rpcUrl: string): ApiClient {
  return new ApiClient({
    baseUrl: rpcUrl,
    timeout: 30_000,
    headers: { 'Content-Type': 'application/json' },
  });
}
