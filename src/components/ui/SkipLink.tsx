'use client';

import { useSkipLink } from '@/src/lib/a11y';

export function SkipLink() {
  const { skipRef, handleSkip } = useSkipLink();

  return (
    <a
      ref={skipRef}
      href="#main-content"
      onClick={handleSkip}
      onKeyDown={(e) => {
        if (e.key === 'Enter') handleSkip(e);
      }}
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:flex focus:h-12 focus:items-center focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-zinc-900 focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:focus:bg-zinc-900 dark:focus:text-zinc-50 dark:focus:ring-zinc-400"
    >
      Skip to main content
    </a>
  );
}
