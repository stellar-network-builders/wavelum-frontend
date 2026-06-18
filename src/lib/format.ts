export function formatDate(
  date: Date | string | number,
  locale: string,
  options?: Intl.DateTimeFormatOptions,
): string {
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, options).format(d);
}

export function formatNumber(
  value: number,
  locale: string,
  options?: Intl.NumberFormatOptions,
): string {
  return new Intl.NumberFormat(locale, options).format(value);
}

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
