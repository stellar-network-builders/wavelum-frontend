import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ToastProvider } from '@/src/components/ui/Toast';
import { ApiError, AppError, WalletError } from '@/src/lib/errors';
import { useErrorToast } from './useErrorToast';

function wrapper({ children }: { children: React.ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>;
}

describe('useErrorToast', () => {
  it('shows mapped API error messages with severity-based toast styles', () => {
    const { result } = renderHook(() => useErrorToast(), { wrapper });

    act(() => {
      result.current.showErrorToast(new ApiError('Raw unauthorized', 401, '/auth'));
    });

    expect(document.body).toHaveTextContent('Your session has expired. Please reconnect your wallet.');
  });

  it('shows wallet-specific mapped messages', () => {
    const { result } = renderHook(() => useErrorToast(), { wrapper });

    act(() => {
      result.current.showErrorToast(new WalletError('No wallet', 'freighter', 'connect'));
    });

    expect(document.body).toHaveTextContent('Freighter wallet not detected. Please install Freighter.');
  });

  it('falls back to the AppError message when no mapping exists', () => {
    const { result } = renderHook(() => useErrorToast(), { wrapper });

    act(() => {
      result.current.showErrorToast(new AppError('Custom failure', 'CUSTOM', 'high'));
    });

    expect(document.body).toHaveTextContent('Custom failure');
  });

  it('converts unknown errors with context before displaying them', () => {
    const { result } = renderHook(() => useErrorToast(), { wrapper });

    act(() => {
      result.current.showErrorToast(new Error('Native failure'), 'wallet');
    });

    expect(document.body).toHaveTextContent('Native failure');
  });

  it('shows success, warning, and info toasts', () => {
    const { result } = renderHook(() => useErrorToast(), { wrapper });

    act(() => {
      result.current.showSuccessToast('Saved');
      result.current.showWarningToast('Careful');
      result.current.showInfoToast('Heads up');
    });

    expect(document.body).toHaveTextContent('Saved');
    expect(document.body).toHaveTextContent('Careful');
    expect(document.body).toHaveTextContent('Heads up');
  });
});
