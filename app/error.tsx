'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';
import { BugBeetle } from '@phosphor-icons/react';

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

/**
 * Error page for the root app segment.
 *
 * This catches errors thrown in the root layout or page (excluding the root
 * layout itself, which is handled by `global-error.tsx`).
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/error
 */
export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4 dark:bg-black">
      <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-8 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        {/* Icon */}
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 dark:bg-red-950">
          <BugBeetle className="h-7 w-7 text-red-500" weight="fill" />
        </div>

        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Something went wrong
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          An unexpected error occurred. Please try again.
        </p>

        {error.digest && (
          <p className="mt-3 text-xs text-zinc-400 dark:text-zinc-500">
            Error ID: <code className="font-mono">{error.digest}</code>
          </p>
        )}

        <div className="mt-6 flex justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-zinc-800 active:bg-zinc-950 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 dark:active:bg-zinc-100"
          >
            Try Again
          </button>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-300 bg-white px-5 py-2.5 text-sm font-medium text-zinc-700 shadow-sm transition-all hover:bg-zinc-50 active:bg-zinc-100 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700 dark:active:bg-zinc-600"
          >
            Refresh Page
          </button>
        </div>
      </div>
    </div>
  );
}
