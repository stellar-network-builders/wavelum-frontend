/**
 * Unit tests for lib/performance.ts.
 */

import { describe, expect, it, vi } from 'vitest';
import { debounceSearch, measureRenderTime, measureAsyncOperation, withPerformanceMark } from '@/lib/performance';

describe('debounceSearch', () => {
  it('delays execution until idle', async () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const debounced = debounceSearch(fn, 300);
    debounced('a'); debounced('b'); debounced('c');
    expect(fn).not.toHaveBeenCalled();
    vi.advanceTimersByTime(300);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('c');
    vi.useRealTimers();
  });

  it('passes all arguments', async () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const debounced = debounceSearch(fn, 100);
    debounced('hello', 42);
    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledWith('hello', 42);
    vi.useRealTimers();
  });
});

describe('measureRenderTime', () => {
  it('returns a no-op function', () => {
    const cleanup = measureRenderTime('TestComponent');
    expect(typeof cleanup).toBe('function');
    expect(() => cleanup()).not.toThrow();
  });
});

describe('measureAsyncOperation', () => {
  it('returns promise result', async () => {
    const result = await measureAsyncOperation('test', () => Promise.resolve(42));
    expect(result).toBe(42);
  });
});

describe('withPerformanceMark', () => {
  it('returns function result', () => {
    expect(withPerformanceMark('test', () => 123)).toBe(123);
  });
});
