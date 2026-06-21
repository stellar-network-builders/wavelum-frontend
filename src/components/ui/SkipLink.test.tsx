import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@/src/test/utils';
import { SkipLink } from './SkipLink';

const mockHandleSkip = vi.fn((e?: React.MouseEvent | React.KeyboardEvent) => {
  e?.preventDefault();
});

vi.mock('@/src/lib/a11y', () => ({
  useSkipLink: () => ({
    skipRef: { current: null },
    handleSkip: mockHandleSkip,
  }),
}));

describe('SkipLink', () => {
  beforeEach(() => {
    mockHandleSkip.mockClear();
  });

  it('renders an anchor with the correct href', () => {
    render(<SkipLink />);
    const link = screen.getByText('Skip to main content');
    expect(link.tagName).toBe('A');
    expect(link).toHaveAttribute('href', '#main-content');
  });

  it('applies sr-only and focus-visible styles via className', () => {
    render(<SkipLink />);
    const link = screen.getByText('Skip to main content');
    expect(link.className).toContain('sr-only');
    expect(link.className).toContain('focus:not-sr-only');
  });

  it('calls handleSkip on click', () => {
    render(<SkipLink />);
    const link = screen.getByText('Skip to main content');
    fireEvent.click(link);
    expect(mockHandleSkip).toHaveBeenCalledTimes(1);
  });

  it('calls handleSkip on Enter keydown', () => {
    render(<SkipLink />);
    const link = screen.getByText('Skip to main content');
    fireEvent.keyDown(link, { key: 'Enter' });
    expect(mockHandleSkip).toHaveBeenCalledTimes(1);
  });

  it('does not call handleSkip on other keydown events', () => {
    render(<SkipLink />);
    const link = screen.getByText('Skip to main content');
    fireEvent.keyDown(link, { key: ' ' });
    expect(mockHandleSkip).not.toHaveBeenCalled();
    fireEvent.keyDown(link, { key: 'Tab' });
    expect(mockHandleSkip).not.toHaveBeenCalled();
  });
});
