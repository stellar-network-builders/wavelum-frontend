'use client';


import { NAV_ITEMS, getActiveNavHref } from '@/config/navigation';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { Link, usePathname } from '@/i18n/navigation';

type NavLinksProps = {
  /** Render icon-only links (desktop collapsed sidebar). */
  collapsed?: boolean;
  /** Invoked after a link is activated — e.g. to close the mobile drawer. */
  onNavigate?: () => void;
};

/**
 * The primary navigation list, shared by the desktop sidebar and the mobile
 * drawer. Resolves the active item from the current (locale-stripped) path and
 * hides admin-only entries from non-admins.
 */
export function NavLinks({ collapsed = false, onNavigate }: NavLinksProps) {
  const pathname = usePathname();
  const isAdmin = useIsAdmin();
  const activeHref = getActiveNavHref(pathname);

  const items = NAV_ITEMS.filter((item) => !item.requiresAdmin || isAdmin);

  return (
    <nav className="flex flex-col gap-1" aria-label="Primary">
      {items.map((item) => {
        const isActive = item.href === activeHref;
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={isActive ? 'page' : undefined}
            title={collapsed ? item.label : undefined}
            className={[
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              collapsed ? 'justify-center' : '',
              isActive
                ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50'
                : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50',
            ].join(' ')}
          >
            <Icon
              className="h-5 w-5 shrink-0"
              weight={isActive ? 'fill' : 'regular'}
              aria-hidden="true"
            />
            {!collapsed && <span className="truncate">{item.label}</span>}
          </Link>
        );
      })}
    </nav>
  );
}
