'use client';

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
