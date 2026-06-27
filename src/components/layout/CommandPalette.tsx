'use client';

import { MagnifyingGlass } from '@phosphor-icons/react';
import * as Dialog from '@radix-ui/react-dialog';
import { useMemo, useState } from 'react';


import { NAV_ITEMS } from '@/config/navigation';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { useRouter } from '@/i18n/navigation';

type CommandPaletteProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/**
 * Command palette (Ctrl/Cmd+K) for fast navigation. Filters dashboard
 * destinations by label; arrow keys move the selection, Enter navigates.
 */
export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />

        <Dialog.Content
          aria-label="Command palette"
          className="fixed left-1/2 top-24 z-50 w-full max-w-lg -translate-x-1/2 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-2xl focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 dark:border-zinc-800 dark:bg-zinc-900"
        >
          <Dialog.Title className="sr-only">Command palette</Dialog.Title>
          {/* Mounted fresh each time the palette opens, so query/selection reset. */}
          <PaletteBody onClose={() => onOpenChange(false)} />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function PaletteBody({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const isAdmin = useIsAdmin();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);

  const results = useMemo(() => {
    const available = NAV_ITEMS.filter((item) => !item.requiresAdmin || isAdmin);
    const q = query.trim().toLowerCase();
    return q ? available.filter((item) => item.label.toLowerCase().includes(q)) : available;
  }, [query, isAdmin]);

  // Clamp during render so the highlight stays valid as results shrink.
  const activeIndex = Math.min(selected, Math.max(results.length - 1, 0));

  function go(href: string) {
    onClose();
    router.push(href);
  }

  function onKeyDown(event: React.KeyboardEvent) {
    if (results.length === 0) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setSelected((activeIndex + 1) % results.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setSelected((activeIndex - 1 + results.length) % results.length);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      go(results[activeIndex].href);
    }
  }

  return (
    <div onKeyDown={onKeyDown}>
      <div className="flex items-center gap-3 border-b border-zinc-200 px-4 dark:border-zinc-800">
        <MagnifyingGlass className="h-5 w-5 shrink-0 text-zinc-400" aria-hidden="true" />
        <input
          autoFocus
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setSelected(0);
          }}
          placeholder="Jump to…"
          aria-label="Search navigation"
          className="h-12 w-full bg-transparent text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none dark:text-zinc-50"
        />
      </div>

      <ul className="max-h-72 overflow-y-auto p-2">
        {results.length === 0 ? (
          <li className="px-3 py-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
            No results
          </li>
        ) : (
          results.map((item, index) => {
            const Icon = item.icon;
            const isActive = index === activeIndex;

            return (
              <li key={item.href}>
                <button
                  type="button"
                  onClick={() => go(item.href)}
                  onMouseEnter={() => setSelected(index)}
                  className={[
                    'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm',
                    isActive
                      ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50'
                      : 'text-zinc-600 dark:text-zinc-400',
                  ].join(' ')}
                >
                  <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}
