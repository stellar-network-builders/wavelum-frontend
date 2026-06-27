'use client';

import { Bell, List, MagnifyingGlass } from '@phosphor-icons/react';

import { LocaleSwitcher } from '@/components/ui';

import { usePathname } from '@/i18n/navigation';

import { Breadcrumbs, crumbsFromPathname } from './Breadcrumbs';
import { ThemeToggle } from './ThemeToggle';
import { WalletStatus } from './WalletStatus';

type HeaderProps = {
  /** Opens the mobile navigation drawer (hamburger). */
  onOpenMobileNav: () => void;
  /** Opens the command palette (search button / Ctrl+K). */
  onOpenCommandPalette: () => void;
};

/**
 * Dashboard top bar: mobile menu trigger, auto-generated breadcrumbs, command
 * palette, wallet status, theme toggle, notifications, and locale switcher.
 */
export function Header({ onOpenMobileNav, onOpenCommandPalette }: HeaderProps) {
  const pathname = usePathname();
  const crumbs = crumbsFromPathname(pathname);

  return (
    <header
      role="banner"
      className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-zinc-200 bg-white/80 px-4 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/80 sm:px-6"
    >
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileNav}
          aria-label="Open navigation menu"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50 md:hidden"
        >
          <List className="h-5 w-5" aria-hidden="true" />
        </button>
        <div className="hidden min-w-0 sm:block">
          <Breadcrumbs crumbs={crumbs} />
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2">
        <button
          type="button"
          onClick={onOpenCommandPalette}
          aria-label="Search (Ctrl+K)"
          className="hidden items-center gap-2 rounded-lg border border-zinc-200 px-3 py-1.5 text-sm text-zinc-500 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 sm:flex"
        >
          <MagnifyingGlass className="h-4 w-4" aria-hidden="true" />
          <span>Search</span>
          <kbd className="rounded border border-zinc-200 bg-zinc-100 px-1.5 text-xs font-medium text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800">
            ⌘K
          </kbd>
        </button>

        <button
          type="button"
          onClick={onOpenCommandPalette}
          aria-label="Search"
          className="grid h-9 w-9 place-items-center rounded-lg text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50 sm:hidden"
        >
          <MagnifyingGlass className="h-5 w-5" aria-hidden="true" />
        </button>

        <WalletStatus />

        <button
          type="button"
          aria-label="Notifications"
          className="relative grid h-9 w-9 place-items-center rounded-lg text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
        >
          <Bell className="h-5 w-5" aria-hidden="true" />
        </button>

        <ThemeToggle />
        <LocaleSwitcher />
      </div>
    </header>
  );
}
