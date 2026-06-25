'use client';

import { useCallback } from 'react';
import { useToast } from '@/src/components/ui/Toast';
import {
  isApiError,
  isWalletError,
  isSorobanError,
  isAppError,
  toAppError,
  type AppError,
} from '@/src/lib/errors';

/**
 * Mapping of error codes to user-friendly messages.
 * These messages are used for toast notifications.
 */
const ERROR_CODE_MESSAGES: Record<string, string> = {
  // API Errors
  API_401: 'Your session has expired. Please reconnect your wallet.',
  API_403: 'You do not have permission to perform this action.',
  API_404: 'The requested resource was not found.',
  API_429: 'Too many requests. Please wait a moment and try again.',
  API_500: 'A server error occurred. Please try again later.',
  API_502: 'Unable to connect to the server. Please check your connection.',
  API_503: 'The service is temporarily unavailable. Please try again later.',

  // Wallet Errors
  WALLET_CONNECT: 'Failed to connect to wallet.',
  WALLET_DISCONNECT: 'Wallet disconnected unexpectedly.',

  // Soroban Errors
  SOROBAN_BUDGETEXCEEDED: 'Transaction fee exceeds budget. Try with smaller amounts.',
  SOROBAN_INSUFFICIENTBALANCE: 'Insufficient balance to complete this transaction.',
  SOROBAN_CONTRACTNOTFOUND: 'The contract could not be found.',
  SOROBAN_EXECUTIONFAILED: 'Contract execution failed.',
};

/**
 * Gets a user-friendly message for an error.
 * Falls back to the error's message if no specific mapping exists.
 */
function getErrorMessage(error: AppError): string {
  // Check for specific error code mapping
  const mappedMessage = ERROR_CODE_MESSAGES[error.code];
  if (mappedMessage) {
    return mappedMessage;
  }

  // For API errors with specific status codes, provide contextual messages
  if (isApiError(error)) {
    switch (error.status) {
      case 0:
        return 'Network connection failed. Please check your internet connection.';
      case 400:
        return 'Invalid request. Please check your input and try again.';
      case 408:
        return 'Request timed out. Please try again.';
      case 504:
        return 'Gateway timeout. The server took too long to respond.';
    }
  }

  // For wallet errors with specific wallet types
  if (isWalletError(error)) {
    if (error.action === 'connect' && error.walletType) {
      const walletMessages: Record<string, string> = {
        freighter: 'Freighter wallet not detected. Please install Freighter.',
        ledger: 'Ledger device not detected. Please connect your Ledger.',
      };
      if (walletMessages[error.walletType.toLowerCase()]) {
        return walletMessages[error.walletType.toLowerCase()];
      }
    }
  }

  // Fall back to the error's own message
  return error.getUserMessage();
}

/**
 * Determines the appropriate toast type based on error severity.
 */
function getToastType(error: AppError): 'success' | 'error' | 'warning' | 'info' {
  switch (error.severity) {
    case 'low':
      return 'info';
    case 'medium':
      return 'warning';
    case 'high':
    case 'critical':
      return 'error';
    default:
      return 'error';
  }
}

/**
 * Hook that provides error toast functionality.
 * Automatically formats error messages based on error type and code.
 */
export function useErrorToast() {
  const { addToast } = useToast();

  /**
   * Shows a toast notification for an error.
   * Automatically formats the message based on error type.
   */
  const showErrorToast = useCallback(
    (error: unknown, context?: string) => {
      const appError = toAppError(error, context);
      const message = getErrorMessage(appError);
      const type = getToastType(appError);

      addToast(message, type);
    },
    [addToast],
  );

  /**
   * Shows a success toast notification.
   */
  const showSuccessToast = useCallback(
    (message: string) => {
      addToast(message, 'success');
    },
    [addToast],
  );

  /**
   * Shows a warning toast notification.
   */
  const showWarningToast = useCallback(
    (message: string) => {
      addToast(message, 'warning');
    },
    [addToast],
  );

  /**
   * Shows an info toast notification.
   */
  const showInfoToast = useCallback(
    (message: string) => {
      addToast(message, 'info');
    },
    [addToast],
  );

  return {
    showErrorToast,
    showSuccessToast,
    showWarningToast,
    showInfoToast,
  };
import { useEffect, useRef } from 'react';
import { useToast } from './useToast';
import { isAppError, ApiError, WalletError, SorobanError, type AppError } from '@/src/lib/errors';

/* -------------------------------------------------------------------------- */
/*  Error → toast message mapping                                             */
/* -------------------------------------------------------------------------- */

type ToastMessage = { title: string; description?: string };

const ERROR_TO_TOAST: Record<string, ToastMessage> = {
  // ── API errors ──────────────────────────────────────────────────────────
  '401': { title: 'Session expired', description: 'Your session has expired. Please reconnect your wallet.' },
  '403': { title: 'Access denied', description: 'You do not have permission to perform this action.' },
  '404': { title: 'Not found', description: 'The requested resource was not found.' },
  '429': { title: 'Rate limited', description: 'Too many requests. Please wait a moment and try again.' },
  '500': { title: 'Server error', description: 'Something went wrong on our end. Please try again later.' },
  '503': { title: 'Service unavailable', description: 'The service is temporarily unavailable. Please try again later.' },
  NETWORK_ERROR: { title: 'Network error', description: 'Unable to reach the server. Check your connection.' },

  // ── Wallet errors ────────────────────────────────────────────────────────
  WALLET_NO_WALLET: { title: 'Wallet not detected', description: 'Freighter wallet not detected. Please install Freighter.' },
  WALLET_REJECTED: { title: 'Request rejected', description: 'The wallet request was rejected by the user.' },
  WALLET_DISCONNECTED: { title: 'Wallet disconnected', description: 'Your wallet has been disconnected.' },
  WALLET_WRONG_NETWORK: { title: 'Wrong network', description: 'Please switch to the correct Stellar network in your wallet.' },

  // ── Soroban errors ───────────────────────────────────────────────────────
  SOROBAN_BUDGET_EXCEEDED: { title: 'Transaction too large', description: 'Transaction fee exceeds budget. Try with smaller amounts.' },
  SOROBAN_CONTRACT_ERROR: { title: 'Contract error', description: 'The smart contract returned an error. Please try again.' },
  SOROBAN_TIMEOUT: { title: 'Transaction timeout', description: 'The transaction timed out. Please try again.' },
};

/**
 * Best-effort mapping from any {@link AppError} to a toast message.
 * Falls back to a generic error toast when no specific mapping exists.
 */
function errorToToast(error: AppError): ToastMessage {
  // Check by error code first
  const byCode = ERROR_TO_TOAST[error.code];
  if (byCode) return byCode;

  // API errors — key by status code
  if (error instanceof ApiError) {
    const byStatus = ERROR_TO_TOAST[String(error.statusCode)];
    if (byStatus) return byStatus;
  }

  // Wallet errors — common codes
  if (error instanceof WalletError) {
    if (error.code?.includes('NO_WALLET') || error.code?.includes('NO_FREIGHTER')) {
      return ERROR_TO_TOAST.WALLET_NO_WALLET;
    }
    if (error.code?.includes('REJECTED') || error.code?.includes('USER_REJECT')) {
      return ERROR_TO_TOAST.WALLET_REJECTED;
    }
  }

  // Soroban errors
  if (error instanceof SorobanError) {
    if (error.errorCode?.includes('BudgetExceeded') || error.errorCode?.includes('budget')) {
      return ERROR_TO_TOAST.SOROBAN_BUDGET_EXCEEDED;
    }
  }

  // Fallback
  return { title: 'Something went wrong', description: error.message };
}

/* -------------------------------------------------------------------------- */
/*  Hook                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Hook that watches an error value and shows the appropriate toast when it
 * transitions from a falsy to a truthy state.
 *
 * @param error - The current error value (any truthy value triggers a toast).
 *
 * @example
 * ```tsx
 * const [apiError, setApiError] = useState<ApiError | null>(null);
 * useErrorToast(apiError);
 * ```
 */
export function useErrorToast(error: AppError | Error | unknown): void {
  const { toast } = useToast();
  const previousRef = useRef<unknown>(error);

  useEffect(() => {
    // Only trigger on transition from falsy → truthy
    if (!error) {
      previousRef.current = error;
      return;
    }

    // Avoid re-showing the same error instance
    if (previousRef.current === error) return;
    previousRef.current = error;

    // Coerce unknown errors if needed
    const appError = isAppError(error)
      ? error
      : error instanceof Error
        ? (error as AppError)
        : null;

    if (!appError) {
      toast({
        title: 'Something went wrong',
        description: String(error),
        variant: 'error',
      });
      return;
    }

    const message = errorToToast(appError);
    toast({
      title: message.title,
      description: message.description,
      variant: 'error',
    });
  }, [error, toast]);
}
