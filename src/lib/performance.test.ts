import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  measureRenderTime,
  debounceSearch,
  measureAsyncOperation,
  withPerformanceMark,
} from './performance';

describe('measureRenderTime', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('returns a no-op function in production', () => {
    vi.stubEnv('NODE_ENV', 'production');
    const stop = measureRenderTime('TestComponent');
    expect(stop).toBeInstanceOf(Function);
    // In production the returned function should not log
    const spy = vi.spyOn(console, 'log');
    stop();
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it('logs render time in development', () => {
    vi.stubEnv('NODE_ENV', 'development');
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const stop = measureRenderTime('TestComponent');
    stop();
    expect(spy).toHaveBeenCalledTimes(1);
    const msg = spy.mock.calls[0][0];
    expect(msg).toContain('[Perf] TestComponent rendered in');
    spy.mockRestore();
  });
});

describe('debounceSearch', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('delays invocation until after the delay period', () => {
    const fn = vi.fn();
    const debounced = debounceSearch(fn, 300);

    debounced('test');
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(300);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('test');
  });

  it('resets the timer on subsequent calls (debounce behavior)', () => {
    const fn = vi.fn();
    const debounced = debounceSearch(fn, 300);

    debounced('a');
    vi.advanceTimersByTime(200);
    debounced('b');
    vi.advanceTimersByTime(200);
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('b');
  });

  it('passes multiple arguments through', () => {
    const fn = vi.fn();
    const debounced = debounceSearch(fn, 100);

    debounced('hello', 42);
    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledWith('hello', 42);
  });

  it('clears previous timer when called again immediately', () => {
    const fn = vi.fn();
    const debounced = debounceSearch(fn, 100);

    debounced();
    debounced();
    debounced();
    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);
  });
});

describe('measureAsyncOperation', () => {
  it('resolves with the original promise value', async () => {
    const result = await measureAsyncOperation('testOp', () => Promise.resolve(42));
    expect(result).toBe(42);
  });

  it('rejects when the inner promise rejects', async () => {
    await expect(
      measureAsyncOperation('testOp', () => Promise.reject(new Error('fail'))),
    ).rejects.toThrow('fail');
  });

  it('dispatches a perf-metric custom event', async () => {
    const spy = vi.fn();
    window.addEventListener('perf-metric', spy);

    await measureAsyncOperation('testOp', () => Promise.resolve('ok'));

    expect(spy).toHaveBeenCalledTimes(1);
    const detail = (spy.mock.calls[0][0] as CustomEvent).detail;
    expect(detail.label).toBe('testOp');
    expect(typeof detail.duration).toBe('number');
    expect(detail.timestamp).toBeGreaterThan(0);

    window.removeEventListener('perf-metric', spy);
  });
});

describe('withPerformanceMark', () => {
  it('returns the result of the wrapped function', () => {
    const result = withPerformanceMark('testMark', () => 'hello');
    expect(result).toBe('hello');
  });

  it('logs performance marks and measure', () => {
    const spy = vi.spyOn(window.performance, 'mark');
    const measureSpy = vi.spyOn(window.performance, 'measure');

    withPerformanceMark('testMark', () => 42);

    expect(spy).toHaveBeenCalledWith('testMark-start');
    expect(spy).toHaveBeenCalledWith('testMark-end');
    expect(measureSpy).toHaveBeenCalledWith('testMark', 'testMark-start', 'testMark-end');

    spy.mockRestore();
    measureSpy.mockRestore();
  });

  it('wraps a function that throws', () => {
    expect(() =>
      withPerformanceMark('errorMark', () => {
        throw new Error('boom');
      }),
    ).toThrow('boom');
  });
});
