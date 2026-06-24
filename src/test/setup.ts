/**
 * Global test setup — runs before every test suite.
 *
 * Configures jsdom, testing-library matchers, MSW server for API mocking,
 * and stubs for Stellar Freighter wallet API.
 */

/// <reference types="vitest/globals" />

import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll } from 'vitest';

import { server } from './mocks/server';

/* ─── MSW Lifecycle ─────────────────────────────────────────────────────── */
beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => {
  cleanup();
  server.resetHandlers();
});
afterAll(() => server.close());

/* ─── Browser API polyfills ─────────────────────────────────────────────── */

if (typeof window !== 'undefined' && !window.matchMedia) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}

if (typeof window !== 'undefined' && !window.scrollTo) {
  window.scrollTo = () => {};
}

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

if (typeof window !== 'undefined' && !window.ResizeObserver) {
  window.ResizeObserver = ResizeObserverStub as unknown as typeof ResizeObserver;
}

class IntersectionObserverStub {
  root: Element | null = null;
  rootMargin = '';
  thresholds: ReadonlyArray<number> = [];
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords(): IntersectionObserverEntry[] { return []; }
}

if (typeof window !== 'undefined' && !window.IntersectionObserver) {
  window.IntersectionObserver = IntersectionObserverStub as unknown as typeof IntersectionObserver;
}

/* ─── Stellar Freighter Wallet mock ──────────────────────────────────────── */

vi.mock('@stellar/freighter-api', () => ({
  isConnected: vi.fn().mockResolvedValue(false),
  getPublicKey: vi.fn().mockResolvedValue(''),
  signTransaction: vi.fn().mockResolvedValue(''),
  signAuthEntry: vi.fn().mockResolvedValue(''),
  signMessage: vi.fn().mockResolvedValue(''),
  requestAccess: vi.fn().mockResolvedValue(false),
  setAllowed: vi.fn(),
}));
