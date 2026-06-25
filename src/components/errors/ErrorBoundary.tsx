'use client';

import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import * as Sentry from '@sentry/nextjs';
import { usePathname } from 'next/navigation';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetKeys?: unknown[];
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Global error boundary component that catches React render errors.
 * Displays a branded fallback UI with recovery options and logs errors to Sentry.
import { Component, type ErrorInfo, type ReactNode } from 'react';
import * as Sentry from '@sentry/nextjs';
import { ArrowsClockwise, ArrowClockwise, BugBeetle } from '@phosphor-icons/react';
import { type ErrorSeverity } from '@/lib/errors';

/* -------------------------------------------------------------------------- */
/*  Sentry severity mapping                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Map our custom ErrorSeverity to Sentry's SeverityLevel.
 */
const SEVERITY_MAP: Record<ErrorSeverity, Sentry.SeverityLevel> = {
  low: 'info',
  medium: 'warning',
  high: 'error',
  critical: 'fatal',
};

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

type ErrorBoundaryProps = {
  /** The child tree this boundary wraps. */
  children: ReactNode;
  /**
   * Optional fallback to render instead of the default branded UI.
   * Receives the caught error and a reset callback.
   */
  fallback?: (props: { error: Error; resetError: () => void }) => ReactNode;
  /**
   * Called when the boundary catches an error (e.g. for analytics).
   */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /**
   * Error severity label used when sending to Sentry.
   * @default "high"
   */
  severity?: ErrorSeverity;
};

type ErrorBoundaryState = {
  hasError: boolean;
  error: Error | null;
};

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Global error boundary that catches render errors in its child tree.
 *
 * Features:
 * - Catches errors and renders a branded fallback UI with recovery buttons.
 * - Logs error details to Sentry with component stack trace.
 * - Resets state on route changes so navigation alone can recover the UI.
 * - Supports custom fallback rendering via the `fallback` prop.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });

    // Log to Sentry with full component stack trace
    Sentry.captureException(error, {
      tags: {
        error_type: 'react_error_boundary',
      },
      contexts: {
        react: {
          component_stack: errorInfo.componentStack,
        },
      },
    });

    // Call optional onError callback
    this.props.onError?.(error, errorInfo);

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error);
      console.error('Component Stack:', errorInfo.componentStack);
    }
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    // Reset error state when resetKeys change (e.g., route change)
    const prevKeys = prevProps.resetKeys || [];
    const currentKeys = this.props.resetKeys || [];

    const keysChanged =
      prevKeys.length !== currentKeys.length ||
      prevKeys.some((key, index) => key !== currentKeys[index]);

    if (keysChanged && this.state.hasError) {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
      });
    }
  }

  handleTryAgain = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleRefreshPage = () => {
    window.location.reload();
  };

  handleReportIssue = () => {
    const errorTitle = this.state.error?.message || 'React Error';
    const errorBody = this.buildGitHubIssueBody();
    const encodedTitle = encodeURIComponent(`[Bug] ${errorTitle}`);
    const encodedBody = encodeURIComponent(errorBody);

    window.open(
      `https://github.com/stellar-network-builders/wavelum-frontend/issues/new?title=${encodedTitle}&body=${encodedBody}`,
      '_blank',
    );
  };

  private buildGitHubIssueBody(): string {
    const { error, errorInfo } = this.state;
    const timestamp = new Date().toISOString();
    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A';

    return [
      '## Error Details',
      '',
      '### Description',
      error?.message || 'An unexpected error occurred.',
      '',
      '### Steps to Reproduce',
      '1. ',
      '',
      '### Expected Behavior',
      '',
      '### Actual Behavior',
      '',
      '---',
      '',
      '## Technical Information',
      '',
      '### Error Stack',
      '```',
      error?.stack || 'No stack trace available',
      '```',
      '',
      '### Component Stack',
      '```',
      errorInfo?.componentStack || 'No component stack available',
      '```',
      '',
      '### Environment',
      `- **Timestamp:** ${timestamp}`,
      `- **User Agent:** ${userAgent}`,
      `- **Page URL:** ${typeof window !== 'undefined' ? window.location.href : 'N/A'}`,
      '',
      '---',
      '',
      '*This issue was auto-generated from the ErrorBoundary component.*',
    ].join('\n');
  }

  render() {
    if (this.state.hasError) {
      // If a custom fallback is provided, use it
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorFallbackUI
          {...this.state}
          onTryAgain={this.handleTryAgain}
          onRefresh={this.handleRefreshPage}
          onReport={this.handleReportIssue}
        />
      );
    }

    return this.props.children;
  }
}

/**
 * Branded fallback UI displayed when an error is caught.
 */
function ErrorFallbackUI({
  error,
  onTryAgain,
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const { onError, severity = 'high' } = this.props;

    // Report to Sentry with component stack trace
    Sentry.withScope((scope) => {
      scope.setLevel(SEVERITY_MAP[severity]);
      scope.setTag('error-boundary', 'true');
      scope.setExtra('componentStack', errorInfo.componentStack ?? '');
      Sentry.captureException(error);
    });

    onError?.(error, errorInfo);
  }

  /** Reset the error state so React re-renders the children. */
  private handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  /** Reload the current page. */
  private handleRefresh = (): void => {
    window.location.reload();
  };

  /** Pre-fill a GitHub issue template in a new tab. */
  private handleReportIssue = (): void => {
    const { error } = this.state;
    const title = encodeURIComponent(`Error: ${error?.message ?? 'Unknown error'}`);
    const body = encodeURIComponent(
      [
        '## Description',
        '',
        'An error was caught by the global error boundary.',
        '',
        '### Error message',
        '```',
        error?.message ?? 'N/A',
        '```',
        '',
        '### Stack trace',
        '```',
        error?.stack ?? 'N/A',
        '```',
        '',
        '### Steps to reproduce',
        '1. ',
        '',
        '### Environment',
        `- URL: ${typeof window !== 'undefined' ? window.location.href : 'N/A'}`,
        `- User Agent: ${typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A'}`,
      ].join('\n'),
    );
    window.open(
      `https://github.com/stellar-network-builders/wavelum-frontend/issues/new?title=${title}&body=${body}`,
      '_blank',
      'noopener,noreferrer',
    );
  };

  render(): ReactNode {
    const { hasError, error } = this.state;
    const { children, fallback } = this.props;

    if (!hasError) return children;

    // If a custom fallback is provided, delegate to it
    if (fallback) {
      return fallback({ error: error ?? new Error('Unknown error'), resetError: this.handleReset });
    }

    // Default branded fallback UI
    return (
      <DefaultFallback
        error={error}
        onRetry={this.handleReset}
        onRefresh={this.handleRefresh}
        onReport={this.handleReportIssue}
      />
    );
  }
}

/* -------------------------------------------------------------------------- */
/*  Default fallback UI                                                       */
/* -------------------------------------------------------------------------- */

function DefaultFallback({
  error,
  onRetry,
  onRefresh,
  onReport,
}: {
  error: Error | null;
  onTryAgain: () => void;
  onRetry: () => void;
  onRefresh: () => void;
  onReport: () => void;
}) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className="flex min-h-[400px] items-center justify-center p-6"
    >
      <div className="w-full max-w-md rounded-lg border border-zinc-200 bg-white p-8 text-center shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
        {/* Error Icon */}
        <div className="mb-4 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
            <svg
              className="h-8 w-8 text-red-600 dark:text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h2 className="mb-2 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          Something went wrong
        </h2>

        {/* Error Message */}
        <p className="mb-6 text-sm text-zinc-600 dark:text-zinc-400">
          {error?.message || 'An unexpected error occurred. Please try again.'}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={onTryAgain}
            className="inline-flex items-center justify-center rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 dark:focus:ring-zinc-400 dark:focus:ring-offset-zinc-900"
          >
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4 dark:bg-black">
      <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-8 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        {/* Icon */}
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 dark:bg-red-950">
          <BugBeetle className="h-7 w-7 text-red-500" weight="fill" />
        </div>

        {/* Heading */}
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Something went wrong
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          An unexpected error occurred. You can try again, refresh the page, or report the issue.
        </p>

        {/* Error detail (collapsed) */}
        {error && (
          <details className="mt-4 cursor-pointer rounded-lg bg-zinc-50 p-3 text-left text-xs dark:bg-zinc-800">
            <summary className="font-medium text-zinc-600 dark:text-zinc-400">
              Error details
            </summary>
            <pre className="mt-2 max-h-32 overflow-auto whitespace-pre-wrap text-zinc-500 dark:text-zinc-400">
              {error.message}
              {'\n'}
              {error.stack}
            </pre>
          </details>
        )}

        {/* Actions */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={onRetry}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-zinc-800 active:bg-zinc-950 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 dark:active:bg-zinc-100"
          >
            <ArrowsClockwise className="h-4 w-4" weight="bold" />
            Try Again
          </button>
          <button
            onClick={onRefresh}
            className="inline-flex items-center justify-center rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 dark:focus:ring-zinc-400 dark:focus:ring-offset-zinc-900"
          >
            Refresh Page
          </button>
        </div>

        {/* Report Issue Link */}
        <div className="mt-6">
          <button
            onClick={onReport}
            className="text-sm text-zinc-500 underline underline-offset-4 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
          >
            Report this issue on GitHub
          </button>
        </div>

        {/* Error Details (Development Only) */}
        {process.env.NODE_ENV === 'development' && error && (
          <details className="mt-6 text-left">
            <summary className="cursor-pointer text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Error Details (Development)
            </summary>
            <pre className="mt-2 max-h-48 overflow-auto rounded bg-zinc-100 p-4 text-xs text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
              {error.stack}
            </pre>
          </details>
        )}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-300 bg-white px-5 py-2.5 text-sm font-medium text-zinc-700 shadow-sm transition-all hover:bg-zinc-50 active:bg-zinc-100 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700 dark:active:bg-zinc-600"
          >
            <ArrowClockwise className="h-4 w-4" weight="bold" />
            Refresh Page
          </button>
          <button
            onClick={onReport}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-300 bg-white px-5 py-2.5 text-sm font-medium text-zinc-700 shadow-sm transition-all hover:bg-zinc-50 active:bg-zinc-100 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700 dark:active:bg-zinc-600"
          >
            Report Issue
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Hook to get the current pathname for use as a reset key.
 * This allows the error boundary to reset when the route changes.
 */
export function useErrorBoundaryResetKey(): string {
  return usePathname();
}
