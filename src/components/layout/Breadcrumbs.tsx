import { CaretRight } from '@phosphor-icons/react/dist/ssr';

import { Link } from '@/i18n/navigation';

export type Crumb = {
  label: string;
  href: string;
};

/**
 * Convert a locale-stripped pathname into breadcrumb segments.
 *
 * `/dashboard/vaults` → [{ Dashboard, /dashboard }, { Vaults, /dashboard/vaults }]
 * Segments are title-cased; hyphens become spaces.
 */
export function crumbsFromPathname(pathname: string): Crumb[] {
  const segments = pathname.split('/').filter(Boolean);

  return segments.map((segment, index) => ({
    href: `/${segments.slice(0, index + 1).join('/')}`,
    label: segment
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' '),
  }));
}

/**
 * Presentational breadcrumb trail. The last crumb is rendered as the current
 * page (not a link). Pass crumbs from {@link crumbsFromPathname}.
 */
export function Breadcrumbs({ crumbs }: { crumbs: Crumb[] }) {
  if (crumbs.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex items-center gap-1.5 text-sm">
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;

          return (
            <li key={crumb.href} className="flex items-center gap-1.5">
              {index > 0 && (
                <CaretRight
                  className="h-3.5 w-3.5 text-zinc-400 dark:text-zinc-600"
                  aria-hidden="true"
                />
              )}
              {isLast ? (
                <span
                  aria-current="page"
                  className="font-medium text-zinc-900 dark:text-zinc-50"
                >
                  {crumb.label}
                </span>
              ) : (
                <Link
                  href={crumb.href}
                  className="text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                >
                  {crumb.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
