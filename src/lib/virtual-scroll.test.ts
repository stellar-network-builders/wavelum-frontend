import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useVirtualScroll } from './virtual-scroll';

describe('useVirtualScroll', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Ensure scrollTo mock is on the prototype
    HTMLElement.prototype.scrollTo = vi.fn();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns the expected shape', () => {
    const { result } = renderHook(() =>
      useVirtualScroll({ itemHeight: 40, totalItems: 100 }),
    );

    expect(result.current.containerRef).toBeInstanceOf(Function);
    expect(Array.isArray(result.current.visibleItems)).toBe(true);
    expect(result.current.totalHeight).toBe(4000);
    expect(result.current.scrollTo).toBeInstanceOf(Function);
  });

  it('calculates total height correctly', () => {
    const { result } = renderHook(() =>
      useVirtualScroll({ itemHeight: 50, totalItems: 20 }),
    );
    expect(result.current.totalHeight).toBe(1000);
  });

  it('calculates total height for zero items', () => {
    const { result } = renderHook(() =>
      useVirtualScroll({ itemHeight: 40, totalItems: 0 }),
    );
    expect(result.current.totalHeight).toBe(0);
    expect(result.current.visibleItems).toEqual([]);
  });

  it('scrollTo calls scrollTo on the container', () => {
    // Create a real div element with mock scrollTo on its prototype
    const mockDiv = document.createElement('div');
    mockDiv.scrollTo = vi.fn();
    Object.defineProperty(mockDiv, 'clientHeight', { value: 400, writable: true });
    mockDiv.addEventListener = vi.fn();
    mockDiv.removeEventListener = vi.fn();

    const { result } = renderHook(() =>
      useVirtualScroll({ itemHeight: 40, totalItems: 100 }),
    );

    act(() => {
      result.current.containerRef(mockDiv);
    });

    act(() => {
      result.current.scrollTo(5);
    });

    expect(mockDiv.scrollTo).toHaveBeenCalledWith({
      top: 200,
      behavior: 'smooth',
    });
  });

  it('handles single item', () => {
    const { result } = renderHook(() =>
      useVirtualScroll({ itemHeight: 40, totalItems: 1 }),
    );
    expect(result.current.totalHeight).toBe(40);
  });
});
