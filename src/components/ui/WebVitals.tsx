'use client';

import { usePerformanceMetrics } from '@/src/hooks/usePerformanceMetrics';

export function WebVitals() {
  usePerformanceMetrics();
  return null;
}
