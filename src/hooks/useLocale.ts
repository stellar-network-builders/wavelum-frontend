'use client';

import { useLocale as useNextIntlLocale, useTranslations } from 'next-intl';
import { useCallback } from 'react';
import { usePathname, useRouter } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';

export function useLocale() {
  const locale = useNextIntlLocale();
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations();

  const setLocale = useCallback(
    (nextLocale: string) => {
      router.replace({ pathname }, { locale: nextLocale });
    },
    [pathname, router],
  );

  return {
    locale,
    setLocale,
    t,
    locales: routing.locales,
    defaultLocale: routing.defaultLocale,
  };
}
