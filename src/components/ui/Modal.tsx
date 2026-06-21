'use client';

import { type ReactNode } from 'react';
import * as Dialog from '@radix-ui/react-dialog';

type ModalProps = {
  /** Control open state externally. */
  open?: boolean;
  /** Called when the user requests to close the modal (ESC, backdrop click). */
  onOpenChange?: (open: boolean) => void;
  /** Element that triggers the modal to open. */
  trigger: ReactNode;
  /** Title shown in the modal header. */
  title: string;
  /** Optional description below the title. */
  description?: string;
  /** Modal body content. */
  children: ReactNode;
  /** Optional footer content (e.g. action buttons). */
  footer?: ReactNode;
};

/**
 * Accessible modal dialog built on Radix Dialog.
 *
 * Features backdrop blur, ESC to close, focus trap, and scroll lock.
 */
export function Modal({
  open,
  onOpenChange,
  trigger,
  title,
  description,
  children,
  footer,
}: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />

        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl border border-zinc-200 bg-white p-6 shadow-xl focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] dark:border-zinc-800 dark:bg-zinc-900"
        >
          <Dialog.Title className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            {title}
          </Dialog.Title>

          {description && (
            <Dialog.Description className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400">
              {description}
            </Dialog.Description>
          )}

          <div className="mt-4">{children}</div>

          {footer && (
            <div className="mt-6 flex items-center justify-end gap-3">
              {footer}
            </div>
          )}

          <Dialog.Close asChild>
            <button
              aria-label="Close"
              className="absolute right-4 top-4 rounded-md p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
            >
              <CloseIcon />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M12 4L4 12M4 4l8 8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
