/**
 * Sentry client-side configuration.
 *
 * This file is loaded in the browser bundle. Only `NEXT_PUBLIC_` environment
 * variables are available here.
 *
 * @see https://docs.sentry.io/platforms/javascript/guides/nextjs/
 */

import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,

    // Performance monitoring sample rate (0–1; 0.2 = 20 % of transactions)
    tracesSampleRate: 0.2,

    // Session Replay
    replaysSessionSampleRate: 0.1,   // 10 % of all sessions
    replaysOnErrorSampleRate: 1.0,   // 100 % of sessions with an error

    // Filter known, non-actionable errors before they reach Sentry
    beforeSend(event) {
      // Ignore benign browser extension errors
      if (event.exception?.values?.some(
        (v) =>
          v.type === 'TypeError' &&
          v.value?.includes('chrome-extension://'),
      )) {
        return null;
      }

      // Ignore network abort errors (user navigated away, etc.)
      if (
        event.exception?.values?.some(
          (v) =>
            v.type === 'DOMException' &&
            (v.value?.includes('The user aborted a request') ||
              v.value?.includes('aborted')),
        )
      ) {
        return null;
      }

      return event;
    },

  });
}
