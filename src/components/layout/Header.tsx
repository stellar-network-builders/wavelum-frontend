'use client';

import Link from 'next/link';

import { LocaleSwitcher } from '@/components/ui';

import { useLocale } from '@/hooks/useLocale';

interface HeaderProps {
  /** Optional class name for additional styling */
  className?: string;
}

/**
 * Application header with navigation, branding, and locale switcher.
 *
 * @example
 * <Header className="sticky top-0 z-50" />
 */
export function Header({ className = '' }: HeaderProps) {
  const { locale } = useLocale();

  return (
    <header
      className={`flex h-16 items-center justify-between border-b border-zinc-200 bg-white px-6 dark:border-zinc-800 dark:bg-zinc-900 ${className}`}
      role="banner"
    >
      <div className="flex items-center gap-4">
        <span className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Lumina
        </span>
        <nav className="ml-8 hidden gap-6 sm:flex" aria-label="Main navigation">
          <Link
            href="/vesting"
            className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
            prefetch={false}
          >
            Vesting
          </Link>
          <Link
            href="/streaming"
            className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
            prefetch={false}
          >
            Streaming
          </Link>
          <Link
            href="/wallet"
            className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
            prefetch={false}
          >
            Wallet
          </Link>
        </nav>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-xs text-zinc-500 dark:text-zinc-500">{locale.toUpperCase()}</span>
        <LocaleSwitcher />
      </div>
    </header>
  );
}
