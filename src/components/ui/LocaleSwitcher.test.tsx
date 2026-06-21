import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@/src/test/utils';
import { LocaleSwitcher } from './LocaleSwitcher';

const mockRouterReplace = vi.fn();
const mockAnnouncePolite = vi.fn();

vi.mock('@/i18n/navigation', () => ({
  usePathname: () => '/en',
  useRouter: () => ({
    replace: mockRouterReplace,
  }),
}));

vi.mock('@/src/hooks/useAnnounce', () => ({
  useAnnounce: () => ({
    announcePolite: mockAnnouncePolite,
    announceAssertive: vi.fn(),
  }),
}));

describe('LocaleSwitcher', () => {
  beforeEach(() => {
    mockRouterReplace.mockClear();
    mockAnnouncePolite.mockClear();
  });

  it('renders the language select element', () => {
    render(<LocaleSwitcher />);
    const select = screen.getByLabelText('Change language');
    expect(select.tagName).toBe('SELECT');
    expect(select).toBeInTheDocument();
  });

  it('displays all four locale options with correct labels', () => {
    render(<LocaleSwitcher />);
    const options = screen.getAllByRole('option');

    expect(options).toHaveLength(4);
    const labels = options.map((opt) => opt.textContent);
    expect(labels).toContain('English');
    expect(labels).toContain('日本語');
    expect(labels).toContain('한국어');
    expect(labels).toContain('中文');
  });

  it('renders the label with sr-only class for accessibility', () => {
    render(<LocaleSwitcher />);
    const label = screen.getByText('Change language');
    expect(label.tagName).toBe('LABEL');
    expect(label).toHaveAttribute('for', 'locale-switcher');
  });

  it('has aria-label on the select element', () => {
    render(<LocaleSwitcher />);
    const select = screen.getByLabelText('Change language');
    expect(select).toHaveAttribute('aria-label', 'Change language');
  });

  it('calls announcePolite and router.replace on locale change', () => {
    render(<LocaleSwitcher />);
    const select = screen.getByLabelText('Change language');

    fireEvent.change(select, { target: { value: 'ja' } });

    expect(mockAnnouncePolite).toHaveBeenCalledWith(
      'Language changed to 日本語',
    );
    expect(mockRouterReplace).toHaveBeenCalledWith(
      { pathname: '/en' },
      { locale: 'ja' },
    );
  });

  it('announces and navigates for all locales', () => {
    render(<LocaleSwitcher />);
    const select = screen.getByLabelText('Change language');

    const testCases = [
      { locale: 'ja', name: '日本語' },
      { locale: 'ko', name: '한국어' },
      { locale: 'zh', name: '中文' },
      { locale: 'en', name: 'English' },
    ];

    for (const { locale, name } of testCases) {
      fireEvent.change(select, { target: { value: locale } });
      expect(mockAnnouncePolite).toHaveBeenCalledWith(
        `Language changed to ${name}`,
      );
      expect(mockRouterReplace).toHaveBeenCalledWith(
        { pathname: '/en' },
        { locale },
      );
    }
  });

  it('does not show spinner when not transitioning', () => {
    render(<LocaleSwitcher />);
    const spinner = screen.queryByRole('status');
    expect(spinner).toBeNull();
  });

  it('select is enabled when not in transition', () => {
    render(<LocaleSwitcher />);
    const select = screen.getByLabelText('Change language');
    expect(select).toBeEnabled();
  });
});
