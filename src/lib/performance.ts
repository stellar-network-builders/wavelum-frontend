/**
 * Measure and log the render duration of a component in development mode.
 * Returns a cleanup function to call when the component has finished rendering.
 *
 * @param componentName - Human-readable name of the component being measured.
 * @returns A no-op or a function that logs the render duration.
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
 * Create a debounced version of a search function.
 * Ensures the wrapped function is only called after `delay` milliseconds of inactivity.
 *
 * @param fn - The function to debounce.
 * @param delay - Milliseconds to wait after the last call before invoking `fn`.
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
 * Measure the duration of an async operation and log it in development mode.
 * Dispatches a `perf-metric` custom event with timing details.
 *
 * @param label - Human-readable label for the operation.
 * @param fn - Async function whose duration will be measured.
 * @returns The resolved value of `fn`.
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
 * Wrap a synchronous function with Performance API marks and measures.
 * Creates start and end marks around `fn` and records a measure.
 *
 * @param label - The label used for both the marks and the measure.
 * @param fn - The synchronous function to measure.
 * @returns The return value of `fn`.
 */
export function withPerformanceMark<T>(label: string, fn: () => T): T {
  performance.mark(`${label}-start`);
  const result = fn();
  performance.mark(`${label}-end`);
  performance.measure(label, `${label}-start`, `${label}-end`);
  return result;
}
