/**
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
