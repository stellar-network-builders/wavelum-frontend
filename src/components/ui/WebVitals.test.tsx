import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@/src/test/utils';
import { WebVitals } from './WebVitals';

const { mockUsePerformanceMetrics } = vi.hoisted(() => ({
  mockUsePerformanceMetrics: vi.fn(),
}));

vi.mock('@/src/hooks/usePerformanceMetrics', () => ({
  usePerformanceMetrics: mockUsePerformanceMetrics,
}));

describe('WebVitals', () => {
  beforeEach(() => {
    mockUsePerformanceMetrics.mockClear();
  });

  it('calls usePerformanceMetrics on mount', () => {
    render(<WebVitals />);
    expect(mockUsePerformanceMetrics).toHaveBeenCalledTimes(1);
  });

  it('renders nothing (returns null)', () => {
    const { container } = render(<WebVitals />);
    expect(container.innerHTML).toBe('');
  });

  it('calls usePerformanceMetrics exactly once per mount', () => {
    const { unmount } = render(<WebVitals />);
    expect(mockUsePerformanceMetrics).toHaveBeenCalledTimes(1);
    unmount();
    render(<WebVitals />);
    expect(mockUsePerformanceMetrics).toHaveBeenCalled();
  });
});
