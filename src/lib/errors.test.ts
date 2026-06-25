import { describe, it, expect } from 'vitest';
import {
  AppError,
  ApiError,
  WalletError,
  SorobanError,
  createNetworkError,
  createAuthError,
  createWalletNotFoundError,
  createWalletDisconnectedError,
  createBudgetExceededError,
  createContractExecutionError,
  isAppError,
  isApiError,
  isWalletError,
  isSorobanError,
  toAppError,
} from './errors';

describe('Error Hierarchy', () => {
  describe('AppError', () => {
    it('creates an error with message, code, and severity', () => {
      const error = new AppError('Test error', 'TEST_ERROR', 'medium');

      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_ERROR');
      expect(error.severity).toBe('medium');
      expect(error.name).toBe('AppError');
    });

    it('returns user message', () => {
      const error = new AppError('User-friendly message', 'TEST', 'low');
      expect(error.getUserMessage()).toBe('User-friendly message');
    });

    it('returns technical details', () => {
      const error = new AppError('Test', 'TEST', 'high');
      const details = error.getTechnicalDetails();

      expect(details).toHaveProperty('name', 'AppError');
      expect(details).toHaveProperty('code', 'TEST');
      expect(details).toHaveProperty('severity', 'high');
      expect(details).toHaveProperty('message', 'Test');
      expect(details).toHaveProperty('stack');
    });

    it('preserves a cause when provided', () => {
      const cause = new Error('Root cause');
      const error = new AppError('Wrapped error', 'WRAPPED', 'critical', cause);

      expect(error.cause).toBe(cause);
    });
  });

  describe('ApiError', () => {
    it('creates an API error with status and endpoint', () => {
      const error = new ApiError('Server error', 500, '/api/data');

      expect(error.status).toBe(500);
      expect(error.endpoint).toBe('/api/data');
      expect(error.severity).toBe('high');
      expect(error.name).toBe('ApiError');
    });

    it('sets severity based on status code', () => {
      expect(new ApiError('Bad Request', 400, '/api').severity).toBe('medium');
      expect(new ApiError('Server Error', 500, '/api').severity).toBe('high');
      expect(new ApiError('Info', 200, '/api').severity).toBe('low');
    });

    it('identifies retryable errors', () => {
      expect(new ApiError('Rate Limited', 429, '/api').isRetryable()).toBe(true);
      expect(new ApiError('Service Unavailable', 503, '/api').isRetryable()).toBe(true);
      expect(new ApiError('Server Error', 500, '/api').isRetryable()).toBe(true);
      expect(new ApiError('Bad Request', 400, '/api').isRetryable()).toBe(false);
    });

    it('includes API metadata in technical details', () => {
      const error = new ApiError('Rate Limited', 429, '/api/data', 30, { retry: true });
      const details = error.getTechnicalDetails();

      expect(details).toMatchObject({
        status: 429,
        endpoint: '/api/data',
        retryAfter: 30,
        responseBody: { retry: true },
      });
    });
  });

  describe('WalletError', () => {
    it('creates a wallet error with wallet type and action', () => {
      const error = new WalletError('Connection failed', 'freighter', 'connect');

      expect(error.walletType).toBe('freighter');
      expect(error.action).toBe('connect');
      expect(error.code).toBe('WALLET_CONNECT');
      expect(error.name).toBe('WalletError');
    });
  });

  describe('SorobanError', () => {
    it('creates a Soroban error with contract name and error code', () => {
      const error = new SorobanError('Budget exceeded', 'vesting', 'BudgetExceeded');

      expect(error.contractName).toBe('vesting');
      expect(error.errorCode).toBe('BudgetExceeded');
      expect(error.code).toBe('SOROBAN_BUDGETEXCEEDED');
      expect(error.name).toBe('SorobanError');
    });
  });

  describe('Error Factories', () => {
    describe('createNetworkError', () => {
      it('creates a network error', () => {
        const error = createNetworkError('/api/data');

        expect(isApiError(error)).toBe(true);
        expect(error.status).toBe(0);
        expect(error.endpoint).toBe('/api/data');
        expect(error.message).toContain('Network connection failed');
      });
    });

    describe('createAuthError', () => {
      it('creates an auth error with default message', () => {
        const error = createAuthError();

        expect(isApiError(error)).toBe(true);
        expect(error.status).toBe(401);
        expect(error.message).toBe('Your session has expired. Please reconnect your wallet.');
      });

      it('creates an auth error with custom message', () => {
        const error = createAuthError('Custom auth message');
        expect(error.message).toBe('Custom auth message');
      });
    });

    describe('createWalletNotFoundError', () => {
      it('creates a Freighter not found error', () => {
        const error = createWalletNotFoundError('freighter');

        expect(isWalletError(error)).toBe(true);
        expect(error.message).toBe('Freighter wallet not detected. Please install Freighter.');
      });

      it('creates a Ledger not found error', () => {
        const error = createWalletNotFoundError('ledger');
        expect(error.message).toBe('Ledger device not detected. Please connect your Ledger.');
      });

      it('creates a generic wallet not found error', () => {
        const error = createWalletNotFoundError('unknown');
        expect(error.message).toBe('unknown wallet not detected. Please install or connect unknown.');
      });
    });

    describe('createWalletDisconnectedError', () => {
      it('creates a wallet disconnected error', () => {
        const error = createWalletDisconnectedError('freighter');

        expect(isWalletError(error)).toBe(true);
        expect(error.message).toBe('Disconnected from freighter wallet. Please reconnect.');
      });
    });

    describe('createBudgetExceededError', () => {
      it('creates a budget exceeded error', () => {
        const error = createBudgetExceededError('vesting');

        expect(isSorobanError(error)).toBe(true);
        expect(error.contractName).toBe('vesting');
        expect(error.errorCode).toBe('BudgetExceeded');
        expect(error.message).toBe('Transaction fee exceeds budget. Try with smaller amounts.');
      });
    });

    describe('createContractExecutionError', () => {
      it('creates a contract execution error', () => {
        const error = createContractExecutionError(
          'Execution failed',
          'vesting',
          'InsufficientBalance',
          'CAVE...',
        );

        expect(isSorobanError(error)).toBe(true);
        expect(error.contractName).toBe('vesting');
        expect(error.errorCode).toBe('InsufficientBalance');
        expect(error.contractAddress).toBe('CAVE...');
      });
    });
  });

  describe('Type Guards', () => {
    it('isAppError identifies AppError instances', () => {
      expect(isAppError(new AppError('test', 'TEST', 'low'))).toBe(true);
      expect(isAppError(new Error('test'))).toBe(false);
      expect(isAppError('string')).toBe(false);
    });

    it('isApiError identifies ApiError instances', () => {
      expect(isApiError(new ApiError('test', 500, '/api'))).toBe(true);
      expect(isApiError(new AppError('test', 'TEST', 'low'))).toBe(false);
    });

    it('isWalletError identifies WalletError instances', () => {
      expect(isWalletError(new WalletError('test', 'freighter', 'connect'))).toBe(true);
      expect(isWalletError(new AppError('test', 'TEST', 'low'))).toBe(false);
    });

    it('isSorobanError identifies SorobanError instances', () => {
      expect(isSorobanError(new SorobanError('test', 'contract', 'CODE'))).toBe(true);
      expect(isSorobanError(new AppError('test', 'TEST', 'low'))).toBe(false);
    });
  });

  describe('toAppError', () => {
    it('returns AppError as-is', () => {
      const error = new AppError('test', 'TEST', 'medium');
      expect(toAppError(error)).toBe(error);
    });

    it('converts Error to AppError', () => {
      const error = new Error('Native error');
      const appError = toAppError(error, 'test');

      expect(isAppError(appError)).toBe(true);
      expect(appError.message).toBe('Native error');
      expect(appError.code).toBe('UNKNOWN_TEST');
    });

    it('converts unknown error to AppError', () => {
      const appError = toAppError('string error', 'context');

      expect(isAppError(appError)).toBe(true);
      expect(appError.message).toBe('An unexpected error occurred.');
      expect(appError.code).toBe('UNKNOWN_CONTEXT');
    });

    it('creates generic error without context', () => {
      const appError = toAppError(null);

      expect(isAppError(appError)).toBe(true);
      expect(appError.code).toBe('UNKNOWN_ERROR');
    });
  });
});
