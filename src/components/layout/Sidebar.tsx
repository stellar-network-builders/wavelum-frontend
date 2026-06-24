'use client';

import { usePathname } from 'next/navigation';

interface SidebarProps {
  /** Optional class name for additional styling */
  className?: string;
}

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: '▦' },
  { href: '/vesting', label: 'Vesting', icon: '◷' },
  { href: '/streaming', label: 'Streaming', icon: '↗' },
  { href: '/wallet', label: 'Wallet', icon: '◉' },
  { href: '/admin', label: 'Admin', icon: '⚙' },
] as const;

/**
 * Application sidebar with navigation links.
 * Highlights the active route based on the current pathname.
 *
 * @example
 * <Sidebar className="w-64" />
 */
export function Sidebar({ className = '' }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={`flex flex-col gap-1 border-r border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 ${className}`}
      aria-label="Sidebar navigation"
    >
      {NAV_ITEMS.map((item) => {
        const isActive = pathname.startsWith(item.href);
        return (
          <a
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              isActive
                ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50'
                : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50'
            }`}
            aria-current={isActive ? 'page' : undefined}
          >
            <span className="text-base" aria-hidden="true">
              {item.icon}
            </span>
            {item.label}
          </a>
        );
      })}
    </aside>
  );
}
