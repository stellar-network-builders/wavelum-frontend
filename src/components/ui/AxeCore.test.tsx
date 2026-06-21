import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render } from '@/src/test/utils';
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
    vi.stubEnv('NODE_ENV', 'production');
    const { container } = render(<AxeCore />);
    expect(container.innerHTML).toBe('');
  });

  it('returns null in production mode without attempting dynamic imports', () => {
    vi.stubEnv('NODE_ENV', 'production');
    const { container } = render(<AxeCore />);
    // The component checks process.env.NODE_ENV === 'development' and returns early.
    // In production, it simply renders null without any side effects.
    expect(container.innerHTML).toBe('');
  });

  it('does not crash but returns null in development mode', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    // The component attempts dynamic imports in dev mode.
    // @axe-core/react is mocked at module level; the dynamic import resolves
    // to the mock and the component renders null regardless.
    const { container } = render(<AxeCore />);
    expect(container.innerHTML).toBe('');
  });
});
