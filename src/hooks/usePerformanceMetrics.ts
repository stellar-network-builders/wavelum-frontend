'use client';

import { useEffect } from 'react';
import { onCLS, onINP, onLCP } from 'web-vitals';

function sendToAnalytics(metric: { name: string; value: number; rating: string }) {
  const body = JSON.stringify({
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    url: window.location.href,
    timestamp: Date.now(),
  });

  if (process.env.NODE_ENV === 'development') {
    console.log(`[Web Vitals] ${metric.name}: ${metric.value.toFixed(2)} (${metric.rating})`);
  }

  fetch('/api/vitals', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    keepalive: true,
  }).catch(() => {});
}

/**
 * Hook that initialises Core Web Vitals (CLS, INP, LCP) reporting.
 * Reports metrics to `/api/vitals` and logs them in development mode.
 */
export function usePerformanceMetrics() {
  useEffect(() => {
    onCLS(sendToAnalytics);
    onINP(sendToAnalytics);
    onLCP(sendToAnalytics);
  }, []);
}
