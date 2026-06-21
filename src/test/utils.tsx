import React, { type ReactElement } from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import enMessages from '@/messages/en.json';

/**
 * All providers needed by the application at test time, composed
 * from innermost to outermost.
 */
function AllProviders({ children }: { children: React.ReactNode }) {
  return (
    <NextIntlClientProvider locale="en" messages={enMessages}>
      {children}
    </NextIntlClientProvider>
  );
}

/**
 * Custom render wrapper that mounts components inside every provider
 * required by the application (i18n, wallet, query, etc.).
 *
 * Returns the standard `@testing-library/react` render result plus
 * the providers for advanced assertions.
 *
 * @example
 * ```ts
 * const { getByText } = customRender(<MyComponent />);
 * ```
 */
function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) {
  return render(ui, { wrapper: AllProviders, ...options });
}

// Re-export everything from testing-library for convenience.
export { act, cleanup, fireEvent, screen, waitFor, within } from '@testing-library/react';
export { customRender as render };
export type { RenderResult, RenderOptions, queries } from '@testing-library/react';
