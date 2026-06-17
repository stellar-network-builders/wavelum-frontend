import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'ja', 'ko', 'zh'],
  defaultLocale: 'en',
  localePrefix: 'always',
});
