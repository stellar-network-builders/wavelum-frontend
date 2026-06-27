'use client';

import { CaretLeft, CaretRight } from '@phosphor-icons/react';

import { Link } from '@/i18n/navigation';

import { useUiStore } from '@/src/stores/uiStore';

import { NavLinks } from './NavLinks';

/**
 * Desktop sidebar with collapsible navigation.
 *
 * Width animates between a 260px expanded rail and a 64px icon-only rail,
 * driven by `uiStore.isSidebarCollapsed` (also toggled by Ctrl/Cmd+B). Hidden
 * below the `md` breakpoint, where {@link MobileNav} takes over.
 */
export function Sidebar() {
  const isCollapsed = useUiStore((state) => state.isSidebarCollapsed);
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);

  return (
    <aside
      aria-label="Sidebar"
      className={[
        'hidden md:flex h-full shrink-0 flex-col border-r border-zinc-200 bg-white',
        'transition-[width] duration-300 ease-in-out dark:border-zinc-800 dark:bg-zinc-900',
        isCollapsed ? 'w-16' : 'w-[260px]',
      ].join(' ')}
    >
      {/* Brand */}
      <div className={`flex h-16 items-center border-b border-zinc-200 px-4 dark:border-zinc-800 ${isCollapsed ? 'justify-center' : ''}`}>
        <Link
          href="/dashboard"
          className="flex items-center gap-2 font-semibold text-zinc-900 dark:text-zinc-50"
          aria-label="Lumina dashboard home"
        >
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 text-sm font-bold text-white">
            L
          </span>
          {!isCollapsed && <span className="text-lg">Lumina</span>}
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto p-3">
        <NavLinks collapsed={isCollapsed} />
      </div>

      {/* Collapse toggle */}
      <div className="border-t border-zinc-200 p-3 dark:border-zinc-800">
        <button
          type="button"
          onClick={toggleSidebar}
          aria-pressed={isCollapsed}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={[
            'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition-colors',
            'hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50',
            isCollapsed ? 'justify-center' : '',
          ].join(' ')}
        >
          {isCollapsed ? (
            <CaretRight className="h-5 w-5 shrink-0" aria-hidden="true" />
          ) : (
            <>
              <CaretLeft className="h-5 w-5 shrink-0" aria-hidden="true" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
