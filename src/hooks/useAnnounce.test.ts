import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAnnounce } from '@/src/hooks/useAnnounce';

describe('useAnnounce', () => {
  let region: HTMLDivElement;

  beforeEach(() => {
    region = document.createElement('div');
    region.id = 'a11y-announcements';
    document.body.appendChild(region);
  });

  afterEach(() => {
    if (document.body.contains(region)) {
      document.body.removeChild(region);
    }
  });

  it('returns announcePolite and announceAssertive callbacks', () => {
    const { result } = renderHook(() => useAnnounce());
    expect(typeof result.current.announcePolite).toBe('function');
    expect(typeof result.current.announceAssertive).toBe('function');
  });

  it('announcePolite creates a polite announcement', () => {
    const { result } = renderHook(() => useAnnounce());

    act(() => {
      result.current.announcePolite('Polite message');
    });

    const child = region.firstChild as HTMLDivElement;
    expect(child).not.toBeNull();
    expect(child.textContent).toBe('Polite message');
    expect(child.getAttribute('role')).toBeNull();
  });

  it('announceAssertive creates an assertive announcement', () => {
    const { result } = renderHook(() => useAnnounce());

    act(() => {
      result.current.announceAssertive('Alert message');
    });

    const child = region.firstChild as HTMLDivElement;
    expect(child).not.toBeNull();
    expect(child.textContent).toBe('Alert message');
    expect(child.getAttribute('role')).toBe('alert');
  });

  it('callbacks are stable references', () => {
    const { result, rerender } = renderHook(() => useAnnounce());
    const firstPolite = result.current.announcePolite;
    const firstAssertive = result.current.announceAssertive;

    rerender();

    expect(result.current.announcePolite).toBe(firstPolite);
    expect(result.current.announceAssertive).toBe(firstAssertive);
  });
});
