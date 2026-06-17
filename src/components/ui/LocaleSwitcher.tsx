'use client';

import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { useTransition, useEffect } from 'react';
import { useAnnounce } from '@/src/hooks/useAnnounce';

export function LocaleSwitcher() {
  const t = useTranslations('LocaleSwitcher');
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { announcePolite } = useAnnounce();

  function onSelectChange(nextLocale: string) {
    const localeName = localeNames[nextLocale] ?? nextLocale;
    announcePolite(`Language changed to ${localeName}`);
    startTransition(() => {
      router.replace({ pathname }, { locale: nextLocale });
    });
  }

  const localeNames: Record<string, string> = {
    en: 'English',
    ja: '日本語',
    ko: '한국어',
    zh: '中文',
  };

  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
      <label htmlFor="locale-switcher" className="sr-only">
        {t('label')}
      </label>
      <select
        id="locale-switcher"
        value={locale}
        onChange={(e) => onSelectChange(e.target.value)}
        disabled={isPending}
        className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-700 shadow-sm transition-colors hover:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2 disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:border-zinc-500 dark:focus:ring-zinc-500"
        aria-label={t('label')}
      >
        {routing.locales.map((loc) => (
          <option key={loc} value={loc}>
            {localeNames[loc] ?? loc}
          </option>
        ))}
      </select>
      {isPending && (
        <span
          className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-600"
          aria-label={t('loading')}
          role="status"
        />
      )}
    </div>
  );
}
