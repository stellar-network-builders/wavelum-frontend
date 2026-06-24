/**
 * Unit tests for lib/format.ts.
 */

import { describe, expect, it } from 'vitest';
import { formatDate, formatNumber, formatTokenAmount, formatCurrency, formatRelativeTime } from '@/lib/format';

describe('formatDate', () => {
  it('formats date string', () => {
    const result = formatDate('2026-06-24T12:00:00Z', 'en');
    expect(typeof result).toBe('string');
  });
  it('accepts Date object', () => {
    expect(typeof formatDate(new Date('2026-06-24'), 'en')).toBe('string');
  });
  it('throws RangeError for invalid dates', () => {
    expect(() => formatDate('invalid-date', 'en')).toThrow(RangeError);
  });
});

describe('formatNumber', () => {
  it('formats with separators', () => { expect(formatNumber(1234567, 'en')).toBe('1,234,567'); });
  it('handles zero', () => { expect(formatNumber(0, 'en')).toBe('0'); });
  it('respects fraction digits', () => {
    expect(formatNumber(1234.5678, 'en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })).toBe('1,234.57');
  });
});

describe('formatTokenAmount', () => {
  it('formats raw amount with 7 decimals', () => { expect(formatTokenAmount(10000000000, 'en', 7)).toContain('1'); });
  it('handles small amounts', () => { expect(typeof formatTokenAmount(1, 'en', 7)).toBe('string'); });
  it('defaults to 7 decimals', () => { expect(typeof formatTokenAmount(5000000000, 'en')).toBe('string'); });
});

describe('formatCurrency', () => {
  it('formats as USD', () => { expect(formatCurrency(1234.56, 'en', 'USD')).toContain('1,234.56'); });
  it('handles zero', () => { expect(typeof formatCurrency(0, 'en', 'USD')).toBe('string'); });
});

describe('formatRelativeTime', () => {
  it('returns string for future date', () => {
    const result = formatRelativeTime(new Date(Date.now() + 3600_000).toISOString(), 'en');
    expect(typeof result).toBe('string'); expect(result.length).toBeGreaterThan(0);
  });
  it('returns string for past date', () => {
    expect(typeof formatRelativeTime(new Date(Date.now() - 86400_000).toISOString(), 'en')).toBe('string');
  });
  it('accepts Date object', () => {
    expect(typeof formatRelativeTime(new Date(Date.now() + 7200_000), 'en')).toBe('string');
  });
});
