import { beforeEach, describe, expect, it, vi } from 'vitest';

const init = vi.fn();
const replayIntegration = vi.fn(() => ({ name: 'Replay' }));

vi.mock('@sentry/nextjs', () => ({
  init,
  replayIntegration,
}));

describe('Sentry configuration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    process.env.NEXT_PUBLIC_SENTRY_DSN = 'https://public@example.com/1';
    process.env.NEXT_PUBLIC_SENTRY_RELEASE = 'test-release';
  });

  it('initializes browser Sentry with replay and filtering hooks', async () => {
    await import('@/sentry.client.config');

    expect(replayIntegration).toHaveBeenCalledWith({
      maskAllText: true,
      blockAllMedia: true,
    });
    expect(init).toHaveBeenCalledWith(
      expect.objectContaining({
        dsn: 'https://public@example.com/1',
        release: 'test-release',
        tracesSampleRate: 0.2,
        replaysSessionSampleRate: 0.1,
        replaysOnErrorSampleRate: 1,
        beforeSend: expect.any(Function),
        beforeBreadcrumb: expect.any(Function),
      }),
    );
  });

  it('filters known browser-extension errors on the client', async () => {
    await import('@/sentry.client.config');
    const config = init.mock.calls[0][0];

    const result = config.beforeSend(
      { exception: { values: [{}] } },
      { originalException: new Error('chrome-extension: content script failed') },
    );

    expect(result).toBeNull();
  });

  it('initializes server Sentry and filters expected 404 errors', async () => {
    await import('@/sentry.server.config');
    const config = init.mock.calls[0][0];

    expect(config).toEqual(
      expect.objectContaining({
        dsn: 'https://public@example.com/1',
        release: 'test-release',
        tracesSampleRate: 0.1,
        beforeSend: expect.any(Function),
      }),
    );
    expect(
      config.beforeSend(
        { exception: { values: [{}] } },
        { originalException: Object.assign(new Error('missing'), { status: 404 }) },
      ),
    ).toBeNull();
  });

  it('initializes edge Sentry with the shared environment settings', async () => {
    await import('@/sentry.edge.config');

    expect(init).toHaveBeenCalledWith(
      expect.objectContaining({
        dsn: 'https://public@example.com/1',
        release: 'test-release',
        tracesSampleRate: 0.1,
      }),
    );
  });
});
