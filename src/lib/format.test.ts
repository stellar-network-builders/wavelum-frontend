import { describe, it, expect } from 'vitest';
import {
  formatDate,
  formatNumber,
  formatTokenAmount,
  formatCurrency,
  formatRelativeTime,
} from './format';

describe('formatDate', () => {
  const date = new Date('2025-06-15T12:00:00Z');

  it('formats a Date object', () => {
    const result = formatDate(date, 'en-US');
    expect(result).toContain('2025');
    expect(result).toContain('15');
  });

  it('formats an ISO string', () => {
    const result = formatDate('2025-06-15T12:00:00Z', 'en-US');
    expect(result).toContain('2025');
  });

  it('formats a timestamp', () => {
    const result = formatDate(date.getTime(), 'en-US');
    expect(result).toContain('2025');
  });

  it('respects locale (Japanese)', () => {
    const result = formatDate(date, 'ja-JP', { dateStyle: 'long' });
    expect(result).toContain('2025');
    expect(result).toContain('6');
  });

  it('accepts custom format options', () => {
    const result = formatDate(date, 'en-US', { month: 'long', year: 'numeric' });
    expect(result).toContain('June');
    expect(result).toContain('2025');
    expect(result).not.toContain('15');
  });
});

describe('formatNumber', () => {
  it('formats a plain number', () => {
    const result = formatNumber(1234567, 'en-US');
    expect(result).toBe('1,234,567');
  });

  it('formats with fraction digits', () => {
    const result = formatNumber(1234.5, 'en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    expect(result).toBe('1,234.50');
  });

  it('respects locale (German grouping)', () => {
    const result = formatNumber(1234567, 'de-DE');
    expect(result).toContain('.');
  });

  it('handles zero', () => {
    const result = formatNumber(0, 'en-US');
    expect(result).toBe('0');
  });

  it('handles negative numbers', () => {
    const result = formatNumber(-42, 'en-US');
    expect(result).toContain('-');
    expect(result).toContain('42');
  });

  it('formats as percent', () => {
    const result = formatNumber(0.75, 'en-US', { style: 'percent' });
    expect(result).toContain('75%');
  });
});

describe('formatTokenAmount', () => {
  it('defaults to 7 fraction digits', () => {
    const result = formatTokenAmount(1234.56789, 'en-US');
    expect(result).toContain('.');
    const parts = result.split('.');
    expect(parts[1].length).toBeLessThanOrEqual(7);
  });

  it('respects custom decimals', () => {
    const result = formatTokenAmount(1234.56789, 'en-US', 2);
    expect(result).toBe('1,234.57');
  });

  it('adds grouping separators', () => {
    const result = formatTokenAmount(1000000, 'en-US');
    expect(result).toContain('1,000,000');
  });
});

describe('formatCurrency', () => {
  it('formats as USD by default', () => {
    const result = formatCurrency(1234.56, 'en-US');
    expect(result).toContain('$');
    expect(result).toContain('1,234.56');
  });

  it('respects custom currency', () => {
    const result = formatCurrency(1234.56, 'en-US', 'EUR');
    expect(result).toContain('€');
  });

  it('handles round numbers', () => {
    const result = formatCurrency(100, 'en-US');
    expect(result).toContain('100.00');
  });
});

describe('formatRelativeTime', () => {
  it('returns "now" or similar for current time', () => {
    const result = formatRelativeTime(new Date(), 'en');
    // Should be very short relative time
    expect(result.length).toBeGreaterThan(0);
  });

  it('formats a past date', () => {
    const past = new Date(Date.now() - 86400 * 3000); // ~8 months ago
    const result = formatRelativeTime(past, 'en');
    expect(result).toContain('ago');
  });

  it('formats a future date', () => {
    const future = new Date(Date.now() + 86400 * 7000);
    const result = formatRelativeTime(future, 'en');
    // RelativeTimeFormat output varies by locale; match common future indicators
    expect(result).toMatch(/in|next|tomorrow|week|month/);
  });

  it('accepts an ISO string', () => {
    const past = new Date(Date.now() - 86400 * 1000);
    const result = formatRelativeTime(past.toISOString(), 'en');
    expect(result.length).toBeGreaterThan(0);
  });

  it('accepts a timestamp', () => {
    const past = Date.now() - 86400 * 1000;
    const result = formatRelativeTime(past, 'en');
    expect(result.length).toBeGreaterThan(0);
  });
});
