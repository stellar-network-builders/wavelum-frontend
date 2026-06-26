'use client';

/**
 * Applies the active theme (`light` | `dark` | `system`) to the document.
 *
 * The source of truth is `uiStore.theme` (persisted to localStorage). This
 * provider resolves `system` against the OS preference, toggles the `.dark` /
 * `.light` class on <html> (Tailwind's class-based dark variant), and keeps
 * `color-scheme` in sync so native form controls and scrollbars match.
 *
 * A blocking inline script in the root layout applies the same class before
 * first paint to avoid a flash of the wrong theme; this provider keeps it in
 * sync thereafter, including live OS changes while in `system` mode.
 */

import { useEffect } from 'react';

import { useUiStore } from '@/src/stores/uiStore';
import type { ThemePreference } from '@/src/types/domain';

function applyTheme(theme: ThemePreference) {
  if (typeof window === 'undefined') return;

  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const resolved = theme === 'system' ? (prefersDark ? 'dark' : 'light') : theme;

  const root = document.documentElement;
  root.classList.toggle('dark', resolved === 'dark');
  root.classList.toggle('light', resolved === 'light');
  root.style.colorScheme = resolved;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useUiStore((state) => state.theme);

  useEffect(() => {
    applyTheme(theme);

    if (theme !== 'system') return;

    // Track live OS changes only while following the system preference.
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => applyTheme('system');
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, [theme]);

  return <>{children}</>;
}
