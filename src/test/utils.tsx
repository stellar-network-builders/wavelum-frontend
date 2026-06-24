/**
 * Test utilities — custom render function with providers.
 */

import type { RenderOptions } from '@testing-library/react';
import { render } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import type { ReactElement, ReactNode } from 'react';

const defaultMessages: Record<string, string> = {
  'common.connectWallet': 'Connect Wallet',
  'common.disconnect': 'Disconnect',
  'common.loading': 'Loading…',
  'vesting.title': 'Vesting Vaults',
  'wallet.title': 'Wallet',
  'dashboard.title': 'Dashboard',
  'streaming.title': 'Token Streaming',
  'admin.title': 'Admin',
};

function AllProviders({ children, locale = 'en', messages }: { children: ReactNode; locale?: string; messages?: Record<string, string> }) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages ?? defaultMessages} timeZone="UTC">
      {children}
    </NextIntlClientProvider>
  );
}

export function renderWithProviders(ui: ReactElement, options: { locale?: string; messages?: Record<string, string> } & Omit<RenderOptions, 'wrapper'> = {}) {
  const { locale, messages, ...renderOptions } = options;
  return render(ui, { wrapper: ({ children }: { children: ReactNode }) => <AllProviders locale={locale} messages={messages}>{children}</AllProviders>, ...renderOptions });
}

export * from '@testing-library/react';
export { renderWithProviders as render };
