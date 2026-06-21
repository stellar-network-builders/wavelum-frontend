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

export function withPerformanceMark<T>(label: string, fn: () => T): T {
  performance.mark(`${label}-start`);
  const result = fn();
  performance.mark(`${label}-end`);
  performance.measure(label, `${label}-start`, `${label}-end`);
  return result;
}
