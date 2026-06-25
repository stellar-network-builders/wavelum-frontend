'use client';

import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (message: string, type: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

/**
 * Toast provider component that manages toast notifications.
import { CheckCircle, XCircle, Warning, Info, X } from '@phosphor-icons/react';
import * as ToastPrimitive from '@radix-ui/react-toast';
import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react';

type ToastVariant = 'success' | 'error' | 'warning' | 'info';

type Toast = {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
  duration?: number;
};

type ToastContextType = {
  /** Show a toast notification. */
  toast: (params: Omit<Toast, 'id'>) => void;
  /** Dismiss a specific toast by id. */
  dismiss: (id: string) => void;
};

const ToastContext = createContext<ToastContextType | null>(null);

/**
 * Provider that wraps the app to enable toast notifications.
 * Include one <ToastProvider> near the root of the app.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType, duration = 5000) => {
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const toast: Toast = { id, message, type, duration };

    setToasts((prev) => [...prev, toast]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, clearToasts }}>
      {children}
      <ToastContainer />
  const addToast = useCallback((params: Omit<Toast, 'id'>) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { ...params, id }]);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast: addToast, dismiss }}>
      <ToastPrimitive.Provider swipeDirection="right">
        {children}

        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
        ))}

        <ToastPrimitive.Viewport className="fixed bottom-0 right-0 z-[100] flex max-w-sm flex-col gap-2 p-4 outline-none" />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  );
}

/**
 * Hook to access toast functionality.
 */
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

/**
 * Internal container component that renders all toasts.
 */
function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const bgColors: Record<ToastType, string> = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    warning: 'bg-yellow-600',
    info: 'bg-blue-600',
  };

  const icons: Record<ToastType, ReactNode> = {
    success: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    error: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    ),
    warning: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
    ),
    info: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  };

  return (
    <div
      role="alert"
      className={`flex items-center gap-3 rounded-md ${bgColors[toast.type]} px-4 py-3 text-white shadow-lg transition-all animate-in slide-in-from-right-full`}
    >
      <span className="flex-shrink-0">{icons[toast.type]}</span>
      <p className="text-sm font-medium">{toast.message}</p>
      <button
        onClick={onDismiss}
        className="ml-auto flex-shrink-0 rounded p-1 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50"
        aria-label="Dismiss notification"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
 * Hook to trigger toast notifications.
 *
 * @example
 * const { toast } = useToast();
 * toast({ title: 'Success!', variant: 'success' });
 */
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a <ToastProvider>');
  }
  return ctx;
}

// ---------------------------------------------------------------------------
// Internal toast item
// ---------------------------------------------------------------------------

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const variantStyles: Record<ToastVariant, string> = {
    success:
      'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950',
    error:
      'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950',
    warning:
      'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950',
    info: 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950',
  };

  const iconMap: Record<ToastVariant, ReactNode> = {
    success: <SuccessIcon />,
    error: <ErrorIcon />,
    warning: <WarningIcon />,
    info: <InfoIcon />,
  };

  return (
    <ToastPrimitive.Root
      duration={toast.duration ?? 5000}
      onOpenChange={(open) => {
        if (!open) onDismiss();
      }}
      className={`flex items-start gap-3 rounded-lg border p-4 shadow-lg backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-right-full ${variantStyles[toast.variant]}`}
    >
      <span className="mt-0.5 shrink-0">{iconMap[toast.variant]}</span>
      <div className="flex-1 min-w-0">
        <ToastPrimitive.Title className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          {toast.title}
        </ToastPrimitive.Title>
        {toast.description && (
          <ToastPrimitive.Description className="mt-0.5 text-xs text-zinc-600 dark:text-zinc-400">
            {toast.description}
          </ToastPrimitive.Description>
        )}
      </div>
      <ToastPrimitive.Close className="shrink-0 rounded p-0.5 text-zinc-400 transition-colors hover:text-zinc-600 dark:hover:text-zinc-300">
        <CloseIcon />
      </ToastPrimitive.Close>
    </ToastPrimitive.Root>
  );
}

// ---------------------------------------------------------------------------
// Icons
// ---------------------------------------------------------------------------

function SuccessIcon() {
  return <CheckCircle weight="fill" className="h-4 w-4 text-emerald-500" />;
}

function ErrorIcon() {
  return <XCircle weight="fill" className="h-4 w-4 text-red-500" />;
}

function WarningIcon() {
  return <Warning weight="fill" className="h-4 w-4 text-amber-500" />;
}

function InfoIcon() {
  return <Info weight="fill" className="h-4 w-4 text-blue-500" />;
}

function CloseIcon() {
  return <X weight="bold" className="h-3 w-3" />;
}
