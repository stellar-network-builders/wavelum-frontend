import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Performance Monitoring
  tracesSampleRate: 0.1, // Lower rate for server-side

  // Environment
  environment: process.env.NODE_ENV || 'development',

  // Release tracking
  release: process.env.NEXT_PUBLIC_SENTRY_RELEASE || 'development',

  // Filter out known non-actionable errors
  beforeSend(event, hint) {
    // Ignore 404 errors from API routes (expected behavior)
    if (event.exception) {
      const error = hint.originalException as Error & { code?: string; status?: number };
      if (error && (error.status === 404 || error.code === 'ENOENT')) {
        return null;
      }
    }

    return event;
  },
});

export { Sentry };
/**
 * Sentry server-side configuration.
 *
 * This file is loaded on the server (API routes, server actions).
 * It has access to all environment variables.
 *
 * @see https://docs.sentry.io/platforms/javascript/guides/nextjs/
 */

import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    tracesSampleRate: 0.2,
  });
}
