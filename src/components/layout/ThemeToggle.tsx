'use client';

import { Desktop, Moon, Sun } from '@phosphor-icons/react';

import { useUiStore } from '@/src/stores/uiStore';
import type { ThemePreference } from '@/src/types/domain';

const ORDER: ThemePreference[] = ['light', 'dark', 'system'];

const META: Record<ThemePreference, { label: string; Icon: typeof Sun }> = {
  light: { label: 'Light', Icon: Sun },
  dark: { label: 'Dark', Icon: Moon },
  system: { label: 'System', Icon: Desktop },
};

/**
 * Cycles the color theme: Light → Dark → System. The choice is persisted in
 * `uiStore` and applied to the document by {@link ThemeProvider}.
 */
export function ThemeToggle() {
  const theme = useUiStore((state) => state.theme);
  const setTheme = useUiStore((state) => state.setTheme);

  const { label, Icon } = META[theme];
  const next = ORDER[(ORDER.indexOf(theme) + 1) % ORDER.length];

  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      aria-label={`Theme: ${label}. Switch to ${META[next].label}.`}
      title={`Theme: ${label}`}
      className="grid h-9 w-9 place-items-center rounded-lg text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
    >
      <Icon className="h-5 w-5" aria-hidden="true" />
    </button>
  );
}
