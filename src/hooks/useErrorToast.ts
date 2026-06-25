'use client';

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
