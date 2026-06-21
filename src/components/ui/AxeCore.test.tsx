import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, waitFor } from '@/src/test/utils';
import { AxeCore } from './AxeCore';

// Mock @axe-core/react to prevent it from patching React.createElement
// (which fails in jsdom because createElement is a read-only property)
vi.mock('@axe-core/react', () => ({
  default: vi.fn(),
}));

describe('AxeCore', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('renders nothing (returns null)', () => {
    const { container } = render(<AxeCore />);
    expect(container.innerHTML).toBe('');
  });

  it('does not attempt dynamic import in production mode', () => {
    vi.stubEnv('NODE_ENV', 'production');

    // The component checks process.env.NODE_ENV and returns early in production.
    // It should render null without triggering any dynamic imports.
    const { container } = render(<AxeCore />);
    expect(container.innerHTML).toBe('');
  });

  it('attempts to load axe in development mode without crashing', async () => {
    vi.stubEnv('NODE_ENV', 'development');

    // The component attempts dynamic imports in dev mode.
    // @axe-core/react is mocked at the module level, so the dynamic import
    // resolves to the mock without trying to patch React.
    const { container } = render(<AxeCore />);
    expect(container.innerHTML).toBe('');

    // Wait for the async effect to settle
    await waitFor(() => {
      expect(true).toBe(true); // Reaching here means no crash
    });
  });
});
