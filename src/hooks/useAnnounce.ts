'use client';

import { useCallback } from 'react';
import { announce } from '@/src/lib/a11y';

/**
 * Hook that provides screen-reader announcement functions.
 *
 * @returns An object with `announcePolite` and `announceAssertive` callbacks.
 */
export function useAnnounce() {
  const announcePolite = useCallback((message: string) => {
    announce(message, 'polite');
  }, []);

  const announceAssertive = useCallback((message: string) => {
    announce(message, 'assertive');
  }, []);

  return { announcePolite, announceAssertive };
}
