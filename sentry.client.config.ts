import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Performance Monitoring
  tracesSampleRate: 0.2, // 20% of transactions for performance monitoring

  // Session Replay
  replaysSessionSampleRate: 0.1, // 10% of sessions for replay
  replaysOnErrorSampleRate: 1.0, // 100% of error sessions for replay

  // Environment
  environment: process.env.NODE_ENV || 'development',

  // Release tracking
  release: process.env.NEXT_PUBLIC_SENTRY_RELEASE || 'development',

  // Integrations
  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  // Filter out known non-actionable errors
  beforeSend(event, hint) {
    // Ignore errors from browser extensions
    if (event.exception) {
      const error = hint.originalException as Error;
      if (error && error.message) {
        const ignorePatterns = [
          /chrome-extension:/i,
          /safari-extension:/i,
          /moz-extension:/i,
          /Non-error script loaded/i,
          /Failed to fetch/i,
          /NetworkError/i,
          /Loading chunk/i,
          /ResizeObserver loop limit exceeded/i,
          /Passive event listener violation/i,
        ];

        for (const pattern of ignorePatterns) {
          if (pattern.test(error.message)) {
            return null;
          }
        }
      }
    }

    // Add user context from wallet connection if available
    if (typeof window !== 'undefined') {
      const walletAddress = (window as Window & { __walletAddress?: string }).__walletAddress;
      if (walletAddress) {
        event.user = {
          ...event.user,
          id: walletAddress,
        };
      }
    }

    return event;
  },

  // Breadcrumb configuration
  beforeBreadcrumb(breadcrumb) {
    // Filter out noisy breadcrumbs
    if (breadcrumb.category === 'ui.click' && breadcrumb.data?.selector === '[data-sentry-ignore]') {
      return null;
    }
    return breadcrumb;
  },
});

// Export for use in instrumentation
export { Sentry };
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
