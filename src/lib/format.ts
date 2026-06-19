/**
 * Format a date according to the given locale and options.
 *
 * @param date - A Date object, ISO string, or timestamp.
 * @param locale - BCP 47 locale tag, e.g. "en-US".
 * @param options - Optional `Intl.DateTimeFormatOptions` overrides.
 * @returns The formatted date string.
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
 * Format a number according to the given locale and options.
 *
 * @param value - The numeric value to format.
 * @param locale - BCP 47 locale tag, e.g. "en-US".
 * @param options - Optional `Intl.NumberFormatOptions` overrides.
 * @returns The formatted number string.
 */
export function formatNumber(
  value: number,
  locale: string,
  options?: Intl.NumberFormatOptions,
): string {
  return new Intl.NumberFormat(locale, options).format(value);
}

/**
 * Format a token amount with locale-aware number formatting.
 *
 * @param value - The raw token amount.
 * @param locale - BCP 47 locale tag, e.g. "en-US".
 * @param decimals - Maximum number of fractional digits (default 7, standard for Stellar).
 * @returns The formatted token amount string.
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
 * Format a numeric value as a currency string.
 *
 * @param value - The amount to format.
 * @param locale - BCP 47 locale tag, e.g. "en-US".
 * @param currency - ISO 4217 currency code (default "USD").
 * @returns The formatted currency string.
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
 * Format a date as a human-readable relative time string (e.g. "3 days ago").
 *
 * @param date - A Date object, ISO string, or timestamp.
 * @param locale - BCP 47 locale tag, e.g. "en-US".
 * @returns A relative time string such as "2 hours ago" or "in 3 days".
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
