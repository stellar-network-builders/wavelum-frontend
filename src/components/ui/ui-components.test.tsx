import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@/src/test/utils';
import { AriaLiveRegion } from './AriaLiveRegion';
import { VisuallyHidden } from './VisuallyHidden';

describe('AriaLiveRegion', () => {
  it('renders with default polite priority', () => {
    render(<AriaLiveRegion>Test announcement</AriaLiveRegion>);
    const el = screen.getByText('Test announcement');
    expect(el).toHaveAttribute('aria-live', 'polite');
    expect(el).toHaveAttribute('aria-atomic', 'true');
  });

  it('renders with assertive priority', () => {
    render(<AriaLiveRegion priority="assertive">Error!</AriaLiveRegion>);
    const el = screen.getByText('Error!');
    expect(el).toHaveAttribute('aria-live', 'assertive');
  });

  it('renders nothing when no children provided', () => {
    const { container } = render(<AriaLiveRegion />);
    const el = container.querySelector('#a11y-announcements');
    expect(el).toBeInTheDocument();
    expect(el?.textContent).toBe('');
  });
});

describe('VisuallyHidden', () => {
  it('renders as a span by default', () => {
    render(<VisuallyHidden>Hidden text</VisuallyHidden>);
    const el = screen.getByText('Hidden text');
    expect(el.tagName).toBe('SPAN');
  });

  it('renders as a div when specified', () => {
    render(<VisuallyHidden as="div">Hidden text</VisuallyHidden>);
    const el = screen.getByText('Hidden text');
    expect(el.tagName).toBe('DIV');
  });

  it('applies sr-only class', () => {
    render(<VisuallyHidden>Hidden</VisuallyHidden>);
    const el = screen.getByText('Hidden');
    expect(el).toHaveClass('sr-only');
  });
});
