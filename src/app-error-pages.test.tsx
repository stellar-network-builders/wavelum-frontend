import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as Sentry from '@sentry/nextjs';
import GlobalError from '@/app/global-error';
import RouteError from '@/app/[locale]/error';

vi.mock('@sentry/nextjs', () => ({
  captureException: vi.fn(),
}));

describe('Next.js error pages', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('reports global errors to Sentry and renders recovery actions', async () => {
    const error = new Error('Global failure');
    const reset = vi.fn();

    render(<GlobalError error={error} reset={reset} />);

    expect(screen.getByText('Application Error')).toBeInTheDocument();
    expect(screen.getByText('An unexpected error occurred. Our team has been notified.')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /try again/i }));
    expect(reset).toHaveBeenCalled();

    await waitFor(() => {
      expect(Sentry.captureException).toHaveBeenCalledWith(error);
    });
  });

  it('reports route errors to Sentry and renders fallback UI', async () => {
    const error = new Error('Route failure');
    const reset = vi.fn();

    render(<RouteError error={error} reset={reset} />);

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Route failure')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /try again/i }));
    expect(reset).toHaveBeenCalled();

    await waitFor(() => {
      expect(Sentry.captureException).toHaveBeenCalledWith(error);
    });
  });
});
