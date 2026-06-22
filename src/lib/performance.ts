/**
 * Measure the render time of a component in development mode.
 * Returns a cleanup function that logs the elapsed time on invocation.
 * In production the returned function is a no-op.
 *
 * @param componentName - Human-readable name used in the log output.
 * @returns A callback that, when called, logs the measured duration.
 */
export function measureRenderTime(componentName: string) {
  if (process.env.NODE_ENV === 'development') {
    const start = performance.now();
    return () => {
      const end = performance.now();
      console.log(`[Perf] ${componentName} rendered in ${(end - start).toFixed(2)}ms`);
    };
  }
  return () => {};
}

/**
 * Create a debounced version of a callback. The returned function delays
 * invocations until `delay` milliseconds have elapsed since the last call.
 * Useful for throttling search inputs and resize handlers.
 *
 * @param fn    - The function to debounce.
 * @param delay - Milliseconds to wait before invoking `fn`.
 * @returns A debounced wrapper with the same parameter signature.
 */
export function debounceSearch<T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Wrap an async operation with timing instrumentation.
 * The measured duration is logged in development and dispatched as a
 * `perf-metric` custom DOM event for external collection.
 *
 * @param label - Identifier included in the log and event payload.
 * @param fn    - The async function to instrument.
 * @returns The same promise that `fn` returns, with timing side effects.
 */
export function measureAsyncOperation(
  label: string,
  fn: () => Promise<unknown>,
): Promise<unknown> {
  const start = performance.now();
  return fn().finally(() => {
    const duration = performance.now() - start;
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Perf] ${label} took ${duration.toFixed(2)}ms`);
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('perf-metric', {
          detail: { label, duration, timestamp: Date.now() },
        }),
      );
    }
  });
}

/**
 * Execute a synchronous function between Performance Mark and Measure
 * calls so that the elapsed time appears in browser dev-tool timelines.
 *
 * @typeParam T - Return type of the wrapped function.
 * @param label - Name used for the start/end marks and the measure.
 * @param fn    - The synchronous function to instrument.
 * @returns The return value of `fn`.
 */
export function withPerformanceMark<T>(label: string, fn: () => T): T {
  performance.mark(`${label}-start`);
  const result = fn();
  performance.mark(`${label}-end`);
  performance.measure(label, `${label}-start`, `${label}-end`);
  return result;
}
