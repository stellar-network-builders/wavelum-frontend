'use client';

import { useEffect, useRef } from 'react';

type ShortcutOptions = {
  /** Require Ctrl (Windows/Linux) or Cmd (macOS). Default: true. */
  meta?: boolean;
  /** Require Shift. Default: false. */
  shift?: boolean;
  /** Disable the listener. */
  enabled?: boolean;
};

/**
 * Register a global keyboard shortcut.
 *
 * Matches the given single key combined with the platform's primary modifier
 * (Ctrl on Windows/Linux, ⌘ on macOS) unless `meta` is disabled.
 *
 * @example
 * useKeyboardShortcut('b', () => toggleSidebar());        // Ctrl/Cmd+B
 * useKeyboardShortcut('k', () => openPalette());          // Ctrl/Cmd+K
 */
export function useKeyboardShortcut(
  key: string,
  handler: () => void,
  { meta = true, shift = false, enabled = true }: ShortcutOptions = {},
) {
  // Keep the latest handler without re-binding the listener each render.
  const handlerRef = useRef(handler);
  useEffect(() => {
    handlerRef.current = handler;
  });

  useEffect(() => {
    if (!enabled) return;

    const onKeyDown = (event: KeyboardEvent) => {
      const metaPressed = event.ctrlKey || event.metaKey;
      if (meta && !metaPressed) return;
      if (!meta && metaPressed) return;
      if (shift && !event.shiftKey) return;
      if (event.key.toLowerCase() !== key.toLowerCase()) return;

      event.preventDefault();
      handlerRef.current();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [key, meta, shift, enabled]);
}
