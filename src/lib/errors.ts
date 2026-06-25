/**
 * Error hierarchy for the Lumina application.
 * Provides typed errors for API, wallet, and Soroban contract operations.
 */

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

/**
 * Base error class for all application errors.
 * Includes error code for internationalization and severity for handling.
 */
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public severity: ErrorSeverity,
    public cause?: Error,
  ) {
    super(message);
    this.name = 'AppError';
    if (cause) {
      this.cause = cause;
    }
  }

  /**
   * Returns a user-friendly message suitable for display.
   */
  getUserMessage(): string {
    return this.message;
  }

  /**
   * Returns technical details for logging/debugging.
   */
  getTechnicalDetails(): Record<string, unknown> {
    return {
      name: this.name,
      code: this.code,
      severity: this.severity,
      message: this.message,
      stack: this.stack,
    };
  }
}

/**
 * Error thrown during API operations.
 */
export class ApiError extends AppError {
  constructor(
    message: string,
    public status: number,
    public endpoint: string,
    public retryAfter?: number,
    public responseBody?: unknown,
    cause?: Error,
  ) {
    const severity = status >= 500 ? 'high' : status >= 400 ? 'medium' : 'low';
    super(message, `API_${status}`, severity, cause);
    this.name = 'ApiError';
  }

  /**
   * Check if this error is retryable.
   */
  isRetryable(): boolean {
    return this.status === 429 || this.status === 503 || this.status >= 500;
  }

  override getTechnicalDetails(): Record<string, unknown> {
    return {
      ...super.getTechnicalDetails(),
      status: this.status,
      endpoint: this.endpoint,
      retryAfter: this.retryAfter,
      responseBody: this.responseBody,
    };
  }
}

/**
 * Error thrown during wallet operations.
 */
export class WalletError extends AppError {
  constructor(
    message: string,
    public walletType: string,
    public action: string,
    cause?: Error,
  ) {
    super(message, `WALLET_${action.toUpperCase()}`, 'medium', cause);
 * Lumina error hierarchy.
 *
 * All application errors extend {@link AppError}, which carries a machine-readable
 * `code` and a `severity` level for routing to the correct UX treatment (toast,
 * fallback UI, Sentry alert).
 */

/* -------------------------------------------------------------------------- */
/*  Base                                                                      */
/* -------------------------------------------------------------------------- */

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

/**
 * Base application error. Every custom error in Lumina should extend this class
 * so that the error boundary and Sentry integration can rely on a uniform shape.
 */
export class AppError extends Error {
  /**
   * @param message  - Human-readable description.
   * @param code     - Machine-readable error code, e.g. `"WALLET_NO_WALLET"`.
   * @param severity - How urgently the error should be surfaced.
   */
  constructor(
    message: string,
    public code: string,
    public severity: ErrorSeverity = 'medium',
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/* -------------------------------------------------------------------------- */
/*  ApiError                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Error returned by or inferred from a backend API response.
 */
export class ApiError extends AppError {
  /**
   * @param message    - Human-readable description.
   * @param code       - Machine-readable error code.
   * @param statusCode - HTTP status code.
   * @param endpoint   - The API path that was called.
   * @param retryAfter - Optional `Retry-After` seconds suggested by the server.
   * @param severity   - Error severity.
   */
  constructor(
    message: string,
    code: string,
    public statusCode: number,
    public endpoint?: string,
    public retryAfter?: number,
    severity: ErrorSeverity = 'medium',
  ) {
    super(message, code, severity);
    this.name = 'ApiError';
  }
}

/* -------------------------------------------------------------------------- */
/*  WalletError                                                               */
/* -------------------------------------------------------------------------- */

/**
 * Error originating from wallet interaction (Freighter, WalletConnect, etc.).
 */
export class WalletError extends AppError {
  /**
   * @param message   - Human-readable description.
   * @param code      - Machine-readable error code.
   * @param walletType - Identifier for the wallet, e.g. `"freighter"`.
   * @param action    - What the user was trying to do, e.g. `"connect"`.
   * @param severity  - Error severity.
   */
  constructor(
    message: string,
    code: string,
    public walletType?: string,
    public action?: string,
    severity: ErrorSeverity = 'high',
  ) {
    super(message, code, severity);
    this.name = 'WalletError';
  }
}

/**
 * Error thrown during Soroban contract interactions.
 */
export class SorobanError extends AppError {
  constructor(
    message: string,
    public contractName: string,
    public errorCode: string,
    public contractAddress?: string,
    cause?: Error,
  ) {
    super(message, `SOROBAN_${errorCode}`, 'high', cause);
/* -------------------------------------------------------------------------- */
/*  SorobanError                                                              */
/* -------------------------------------------------------------------------- */

/**
 * Error originating from a Soroban smart-contract invocation.
 */
export class SorobanError extends AppError {
  /**
   * @param message    - Human-readable description.
   * @param code       - Machine-readable error code.
   * @param contractName - Name or ID of the contract that was called.
   * @param errorCode  - Optional Soroban-specific error code (e.g. `"BudgetExceeded"`).
   * @param severity   - Error severity.
   */
  constructor(
    message: string,
    code: string,
    public contractName?: string,
    public errorCode?: string,
    severity: ErrorSeverity = 'high',
  ) {
    super(message, code, severity);
    this.name = 'SorobanError';
  }
}

// ── Specific error factories ──

/**
 * Creates an error for network connectivity issues.
 */
export function createNetworkError(endpoint: string, cause?: Error): ApiError {
  return new ApiError(
    'Network connection failed. Please check your internet connection.',
    0,
    endpoint,
    undefined,
    undefined,
    cause,
  );
}

/**
 * Creates an error for authentication/authorization failures.
 */
export function createAuthError(message?: string, cause?: Error): ApiError {
  return new ApiError(
    message || 'Your session has expired. Please reconnect your wallet.',
    401,
    '/auth',
    undefined,
    undefined,
    cause,
  );
}

/**
 * Creates an error for wallet not found/not installed.
 */
export function createWalletNotFoundError(walletType: string): WalletError {
  const messages: Record<string, string> = {
    freighter: 'Freighter wallet not detected. Please install Freighter.',
    ledger: 'Ledger device not detected. Please connect your Ledger.',
    default: `${walletType} wallet not detected. Please install or connect ${walletType}.`,
  };
  return new WalletError(
    messages[walletType.toLowerCase()] || messages.default,
    walletType,
    'connect',
  );
}

/**
 * Creates an error for wallet disconnection.
 */
export function createWalletDisconnectedError(walletType: string): WalletError {
  return new WalletError(
    `Disconnected from ${walletType} wallet. Please reconnect.`,
    walletType,
    'disconnect',
  );
}

/**
 * Creates an error for Soroban budget exceeded.
 */
export function createBudgetExceededError(
  contractName: string,
  contractAddress?: string,
): SorobanError {
  return new SorobanError(
    'Transaction fee exceeds budget. Try with smaller amounts.',
    contractName,
    'BudgetExceeded',
    contractAddress,
  );
}

/**
 * Creates an error for Soroban contract execution failures.
 */
export function createContractExecutionError(
  message: string,
  contractName: string,
  errorCode: string,
  contractAddress?: string,
): SorobanError {
  return new SorobanError(message, contractName, errorCode, contractAddress);
}

/**
 * Type guard to check if an error is an AppError.
/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Check whether an unknown value is an {@link AppError} (or subclass).
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/**
 * Type guard to check if an error is an ApiError.
 */
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

/**
 * Type guard to check if an error is a WalletError.
 */
export function isWalletError(error: unknown): error is WalletError {
  return error instanceof WalletError;
}

/**
 * Type guard to check if an error is a SorobanError.
 */
export function isSorobanError(error: unknown): error is SorobanError {
  return error instanceof SorobanError;
}

/**
 * Converts an unknown error to an AppError.
 * If the error is already an AppError, it is returned as-is.
 * Otherwise, a generic AppError is created.
 */
export function toAppError(error: unknown, context?: string): AppError {
  if (isAppError(error)) {
    return error;
  }

  if (error instanceof Error) {
    return new AppError(
      error.message || 'An unexpected error occurred.',
      context ? `UNKNOWN_${context.toUpperCase()}` : 'UNKNOWN_ERROR',
      'medium',
      error,
    );
  }

  return new AppError(
    'An unexpected error occurred.',
    context ? `UNKNOWN_${context.toUpperCase()}` : 'UNKNOWN_ERROR',
    'medium',
  );
}
 * Coerce an unknown error into a plain {@link AppError}.
 * If it is already an `AppError` it is returned as-is.
 */
export function toAppError(error: unknown): AppError {
  if (isAppError(error)) return error;
  if (error instanceof Error) {
    return new AppError(error.message, 'UNKNOWN', 'medium');
  }
  return new AppError(String(error), 'UNKNOWN', 'medium');
}
