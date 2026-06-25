import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as Sentry from '@sentry/nextjs';
import { ErrorBoundary } from './ErrorBoundary';

vi.mock('@sentry/nextjs', () => ({
  captureException: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  usePathname: () => '/test-path',
}));

function ThrowingChild({ message = 'Render failed' }: { message?: string }) {
  throw new Error(message);
}

describe('ErrorBoundary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('renders children when no error is thrown', () => {
    render(
      <ErrorBoundary>
        <div>Healthy content</div>
      </ErrorBoundary>,
    );

    expect(screen.getByText('Healthy content')).toBeInTheDocument();
  });

  it('renders fallback UI and reports caught errors to Sentry', () => {
    const onError = vi.fn();

    render(
      <ErrorBoundary onError={onError}>
        <ThrowingChild message="Boundary failure" />
      </ErrorBoundary>,
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Boundary failure')).toBeInTheDocument();
    expect(Sentry.captureException).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        tags: { error_type: 'react_error_boundary' },
        contexts: {
          react: {
            component_stack: expect.any(String),
          },
        },
      }),
    );
    expect(onError).toHaveBeenCalledWith(expect.any(Error), expect.any(Object));
  });

  it('renders a custom fallback when provided', () => {
    render(
      <ErrorBoundary fallback={<div>Custom fallback</div>}>
        <ThrowingChild />
      </ErrorBoundary>,
    );

    expect(screen.getByText('Custom fallback')).toBeInTheDocument();
  });

  it('allows users to retry rendering after an error', () => {
    function MaybeThrowingChild({ shouldThrow }: { shouldThrow: boolean }) {
      if (shouldThrow) {
        throw new Error('Temporary failure');
      }
      return <div>Recovered content</div>;
    }

    const { rerender } = render(
      <ErrorBoundary>
        <MaybeThrowingChild shouldThrow />
      </ErrorBoundary>,
    );

    rerender(
      <ErrorBoundary>
        <MaybeThrowingChild shouldThrow={false} />
      </ErrorBoundary>,
    );

    fireEvent.click(screen.getByRole('button', { name: /try again/i }));

    expect(screen.getByText('Recovered content')).toBeInTheDocument();
  });

  it('opens a prefilled GitHub issue from the report action', () => {
    const open = vi.spyOn(window, 'open').mockImplementation(() => null);

    render(
      <ErrorBoundary>
        <ThrowingChild message="Reportable failure" />
      </ErrorBoundary>,
    );

    fireEvent.click(screen.getByRole('button', { name: /report this issue on github/i }));

    expect(open).toHaveBeenCalledWith(
      expect.stringContaining('issues/new?title='),
      '_blank',
    );
    expect(open.mock.calls[0][0]).toContain(encodeURIComponent('[Bug] Reportable failure'));
  });
});
