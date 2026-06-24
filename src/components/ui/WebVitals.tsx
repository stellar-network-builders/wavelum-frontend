'use client';

import { usePerformanceMetrics } from '@/hooks/usePerformanceMetrics';

export function WebVitals() {
  usePerformanceMetrics();
  return null;
}
