'use client';

import { X } from '@phosphor-icons/react';
import * as Dialog from '@radix-ui/react-dialog';

import { NavLinks } from './NavLinks';

type MobileNavProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/**
 * Slide-out navigation drawer for mobile (<768px). Built on Radix Dialog for
 * focus trapping, scroll lock, and ESC-to-close. Opened from the header
 * hamburger; closes automatically on navigation.
 */
export function MobileNav({ open, onOpenChange }: MobileNavProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 md:hidden" />

        <Dialog.Content
          aria-label="Navigation menu"
          className="fixed inset-y-0 left-0 z-50 flex w-[280px] max-w-[85vw] flex-col border-r border-zinc-200 bg-white shadow-xl transition-transform duration-300 ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left dark:border-zinc-800 dark:bg-zinc-900 md:hidden"
        >
          <div className="flex h-16 items-center justify-between border-b border-zinc-200 px-4 dark:border-zinc-800">
            <Dialog.Title className="flex items-center gap-2 font-semibold text-zinc-900 dark:text-zinc-50">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 text-sm font-bold text-white">
                L
              </span>
              <span className="text-lg">Lumina</span>
            </Dialog.Title>
            <Dialog.Close
              aria-label="Close navigation"
              className="grid h-9 w-9 place-items-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </Dialog.Close>
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            <NavLinks onNavigate={() => onOpenChange(false)} />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
