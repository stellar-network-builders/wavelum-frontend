import {
  ChartBar,
  ClockCounterClockwise,
  Lightning,
  ShieldCheck,
  SquaresFour,
  Vault,
  type Icon,
} from '@phosphor-icons/react';

/**
 * Primary dashboard navigation.
 *
 * `href` values are locale-agnostic — render them with the locale-aware
 * `Link`/`usePathname` from `@/i18n/navigation` so the active locale prefix is
 * preserved. Items flagged `requiresAdmin` are hidden from non-admin users.
 */
export type NavItem = {
  label: string;
  href: string;
  icon: Icon;
  requiresAdmin?: boolean;
};

export const NAV_ITEMS: readonly NavItem[] = [
  { label: 'Portfolio', href: '/dashboard', icon: SquaresFour },
  { label: 'Vesting Vaults', href: '/dashboard/vaults', icon: Vault },
  { label: 'Token Streaming', href: '/dashboard/streaming', icon: Lightning },
  { label: 'Claims History', href: '/dashboard/claims', icon: ClockCounterClockwise },
  { label: 'Analytics', href: '/dashboard/analytics', icon: ChartBar },
  { label: 'Admin', href: '/dashboard/admin', icon: ShieldCheck, requiresAdmin: true },
] as const;

/**
 * Resolve the active nav item for a (locale-stripped) pathname. The longest
 * matching `href` wins so `/dashboard/vaults` doesn't also match `/dashboard`.
 */
export function getActiveNavHref(pathname: string): string | null {
  const matches = NAV_ITEMS.filter(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  );
  if (matches.length === 0) return null;
  return matches.reduce((longest, item) =>
    item.href.length > longest.href.length ? item : longest,
  ).href;
}
