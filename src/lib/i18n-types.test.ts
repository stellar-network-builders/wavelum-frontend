import { describe, it, expect } from 'vitest';
import { isTranslationKey } from './i18n-types';
import type { TranslationKey } from './i18n-types';

describe('isTranslationKey', () => {
  it('returns true for a valid top-level key', () => {
    expect(isTranslationKey('Common.loading')).toBe(true);
  });

  it('returns true for valid nested keys', () => {
    expect(isTranslationKey('HomePage.title')).toBe(true);
    expect(isTranslationKey('HomePage.subtitle')).toBe(true);
    expect(isTranslationKey('Wallet.connect')).toBe(true);
    expect(isTranslationKey('Vesting.totalVested')).toBe(true);
    expect(isTranslationKey('LocaleSwitcher.label')).toBe(true);
  });

  it('returns false for non-existent keys', () => {
    expect(isTranslationKey('HomePage.nonexistent')).toBe(false);
    expect(isTranslationKey('NonExistent.key')).toBe(false);
  });

  it('returns false for partial key paths that resolve to objects not strings', () => {
    expect(isTranslationKey('HomePage')).toBe(false);
    expect(isTranslationKey('Common')).toBe(false);
  });

  it('returns false for empty string', () => {
    expect(isTranslationKey('')).toBe(false);
  });

  it('narrows the TypeScript type when true', () => {
    const key = 'HomePage.title';
    if (isTranslationKey(key)) {
      // This should compile — verifying the type guard works
      const validKey: TranslationKey = key;
      expect(validKey).toBe('HomePage.title');
    }
  });
});
