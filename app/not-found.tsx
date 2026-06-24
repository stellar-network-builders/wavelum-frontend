import Link from 'next/link';
import { MagnifyingGlass } from '@phosphor-icons/react/dist/ssr';

/**
 * 404 – Page not found.
 *
 * Rendered by Next.js when a route is not matched by any file-convention
 * page or when `notFound()` is called.
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/not-found
 */
export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4 dark:bg-black">
      <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-8 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        {/* Icon */}
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 dark:bg-amber-950">
          <MagnifyingGlass className="h-7 w-7 text-amber-500" weight="fill" />
        </div>

        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Page not found
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          The page you are looking for does not exist or has been moved.
        </p>

        <div className="mt-6">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-zinc-800 active:bg-zinc-950 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 dark:active:bg-zinc-100"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
