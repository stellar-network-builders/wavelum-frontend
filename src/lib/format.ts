/**
 * Format a date value according to locale using `Intl.DateTimeFormat`.
 *
 * @param date    - A Date object, ISO string, or timestamp.
 * @param locale  - BCP 47 language tag (e.g. "en-US").
 * @param options - Overrides for the default date/time formatting.
 * @returns A locale-aware date string.
 */
export function formatDate(
  date: Date | string | number,
  locale: string,
  options?: Intl.DateTimeFormatOptions,
): string {
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, options).format(d);
}

/**
 * Format a number according to locale using `Intl.NumberFormat`.
 *
 * @param value   - The numeric value to format.
 * @param locale  - BCP 47 language tag.
 * @param options - Overrides for grouping, fraction digits, style, etc.
 * @returns A locale-aware number string.
 */
export function formatNumber(
  value: number,
  locale: string,
  options?: Intl.NumberFormatOptions,
): string {
  return new Intl.NumberFormat(locale, options).format(value);
}

/**
 * Format a token amount with locale-aware grouping and fraction digits.
 * Defaults to 7 decimal places (Stellar's native precision).
 *
 * @param value    - Raw token amount.
 * @param locale   - BCP 47 language tag.
 * @param decimals - Maximum fraction digits. Default 7.
 * @returns A locale-aware number string.
 */
export function formatTokenAmount(
  value: number,
  locale: string,
  decimals: number = 7,
): string {
  return formatNumber(value, locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: decimals,
  });
}

/**
 * Format a monetary value as a locale-aware currency string.
 *
 * @param value    - Amount in the base unit of the currency.
 * @param locale   - BCP 47 language tag.
 * @param currency - ISO 4217 currency code. Default "USD".
 * @returns A string such as "$1,234.56" (locale dependent).
 */
export function formatCurrency(
  value: number,
  locale: string,
  currency: string = 'USD',
): string {
  return formatNumber(value, locale, {
    style: 'currency',
    currency,
  });
}

/**
 * Format a date relative to now using `Intl.RelativeTimeFormat`.
 * Produces strings like "3 days ago" or "in 2 hours".
 *
 * @param date   - A Date object, ISO string, or timestamp.
 * @param locale - BCP 47 language tag.
 * @returns A locale-aware relative time string.
 */
export function formatRelativeTime(
  date: Date | string | number,
  locale: string,
): string {
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  const diffSeconds = Math.round(diffMs / 1000);
  const absDiffSeconds = Math.abs(diffSeconds);

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  const units: { unit: Intl.RelativeTimeFormatUnit; seconds: number }[] = [
    { unit: 'year', seconds: 31536000 },
    { unit: 'month', seconds: 2592000 },
    { unit: 'week', seconds: 604800 },
    { unit: 'day', seconds: 86400 },
    { unit: 'hour', seconds: 3600 },
    { unit: 'minute', seconds: 60 },
    { unit: 'second', seconds: 1 },
  ];

  for (const { unit, seconds } of units) {
    if (absDiffSeconds >= seconds) {
      return rtf.format(Math.round(diffSeconds / seconds), unit);
    }
  }

  return rtf.format(0, 'second');
}
