import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import {
  announce,
  focusTrap,
  useSkipLink,
  useReducedMotion,
  useKeyboardNavigation,
} from './a11y';

describe('announce', () => {
  let region: HTMLDivElement;

  beforeEach(() => {
    region = document.createElement('div');
    region.id = 'a11y-announcements';
    document.body.appendChild(region);
    vi.useFakeTimers();
  });

  afterEach(() => {
    if (region && document.body.contains(region)) {
      document.body.removeChild(region);
    }
    vi.useRealTimers();
  });

  it('creates a div with the message text', () => {
    announce('Test message');
    const child = region.firstChild as HTMLDivElement;
    expect(child).not.toBeNull();
    expect(child.textContent).toBe('Test message');
  });

  it('uses polite priority by default (no role attribute)', () => {
    announce('Polite message');
    const child = region.firstChild as HTMLDivElement;
    expect(child.getAttribute('role')).toBeNull();
  });

  it('uses role="alert" for assertive priority', () => {
    announce('Assertive message', 'assertive');
    const child = region.firstChild as HTMLDivElement;
    expect(child.getAttribute('role')).toBe('alert');
  });

  it('removes the message after 3 seconds', () => {
    announce('Temporary');
    expect(region.childNodes.length).toBe(1);
    vi.advanceTimersByTime(3000);
    expect(region.childNodes.length).toBe(0);
  });

  it('does nothing when the region element is missing', () => {
    document.body.removeChild(region);
    expect(() => announce('No region')).not.toThrow();
  });
});

describe('focusTrap', () => {
  let container: HTMLDivElement;
  let btn1: HTMLButtonElement;
  let btn2: HTMLButtonElement;

  beforeEach(() => {
    container = document.createElement('div');
    btn1 = document.createElement('button');
    btn2 = document.createElement('button');
    container.appendChild(btn1);
    container.appendChild(btn2);
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it('returns a cleanup function', () => {
    const cleanup = focusTrap(container);
    expect(typeof cleanup).toBe('function');
    cleanup();
  });

  it('returns a no-op cleanup for null container', () => {
    const cleanup = focusTrap(null);
    expect(typeof cleanup).toBe('function');
    cleanup();
  });

  it('wraps focus from last to first on Tab', () => {
    const cleanup = focusTrap(container);
    btn2.focus();
    const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true });
    document.dispatchEvent(event);
    expect(document.activeElement).toBe(btn1);
    cleanup();
  });

  it('wraps focus from first to last on Shift+Tab', () => {
    const cleanup = focusTrap(container);
    btn1.focus();
    const event = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true });
    document.dispatchEvent(event);
    expect(document.activeElement).toBe(btn2);
    cleanup();
  });

  it('ignores non-Tab key events', () => {
    const cleanup = focusTrap(container);
    btn1.focus();
    const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
    document.dispatchEvent(event);
    expect(document.activeElement).toBe(btn1);
    cleanup();
  });
});

describe('useSkipLink', () => {
  it('returns skipRef and handleSkip', () => {
    const { result } = renderHook(() => useSkipLink());
    expect(result.current.skipRef).toBeDefined();
    expect(result.current.skipRef.current).toBeNull();
    expect(typeof result.current.handleSkip).toBe('function');
  });
});

describe('useReducedMotion', () => {
  it('returns false when no preference is set', () => {
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(false);
  });
});

describe('useKeyboardNavigation', () => {
  it('returns containerRef, focusedIndex, and focusItem', () => {
    const { result } = renderHook(() => useKeyboardNavigation(10));
    expect(result.current.containerRef).toBeInstanceOf(Function);
    expect(result.current.focusedIndex).toBe(-1);
    expect(result.current.focusItem).toBeInstanceOf(Function);
  });
});
