import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';

import { ErrorBoundary } from '@/components/errors';
import { LocaleSwitcher, ToastProvider } from '@/components/ui';

import { routing } from '@/i18n/routing';

import { ApiClientProvider } from '@/src/providers/ApiClientProvider';

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Omit<Props, 'children'>): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'HomePage' });

  return {
    title: t('title'),
    description: t('subtitle'),
  };
}

export default async function LocaleLayout({ children }: Props) {
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <ErrorBoundary>
        <ToastProvider>
          <ApiClientProvider>
            <LocaleSwitcher />
            {children}
          </ApiClientProvider>
        </ToastProvider>
      </ErrorBoundary>
    </NextIntlClientProvider>
  );
}
