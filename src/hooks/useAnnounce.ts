'use client';

import { useCallback } from 'react';
import { announce } from '@/src/lib/a11y';

/**
 * Hook that returns two stable callbacks for dispatching screen-reader
 * announcements at polite and assertive priority levels.
 *
 * @returns `{ announcePolite, announceAssertive }` — each accepts a
 *          message string.
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
