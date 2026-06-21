import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeAll, afterAll, vi } from 'vitest';

afterEach(() => {
  cleanup();
});

// --- Browser API mocks for jsdom ---

beforeAll(() => {
  // matchMedia mock
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });

  // IntersectionObserver mock
  Object.defineProperty(window, 'IntersectionObserver', {
    writable: true,
    value: vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
      takeRecords: vi.fn(),
    })),
  });

  // ResizeObserver mock (must be callable with `new`)
  function MockResizeObserver() {
    return {
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    };
  }
  Object.defineProperty(window, 'ResizeObserver', {
    writable: true,
    value: MockResizeObserver,
  });

  // crypto.getRandomValues mock
  if (!globalThis.crypto) {
    Object.defineProperty(globalThis, 'crypto', {
      value: {
        getRandomValues: (arr: Uint8Array) => {
          for (let i = 0; i < arr.length; i++) {
            arr[i] = Math.floor(Math.random() * 256);
          }
          return arr;
        },
      },
    });
  }

  // scrollTo mock
  if (!window.HTMLElement.prototype.scrollTo) {
    Object.defineProperty(window.HTMLElement.prototype, 'scrollTo', {
      writable: true,
      value: vi.fn(),
    });
  }

  // requestAnimationFrame mock
  vi.spyOn(window, 'requestAnimationFrame').mockImplementation(
    (cb: FrameRequestCallback): number => {
      return setTimeout(() => cb(Date.now()), 0) as unknown as number;
    },
  );

  // Performance API mocks
  if (!window.performance.mark) {
    Object.defineProperty(window.performance, 'mark', {
      writable: true,
      value: vi.fn(),
    });
  }
  if (!window.performance.measure) {
    Object.defineProperty(window.performance, 'measure', {
      writable: true,
      value: vi.fn(),
    });
  }

  // Stellar Freighter API mock
  (globalThis as Record<string, unknown>).freighterApi = {
    isConnected: vi.fn().mockResolvedValue(false),
    getPublicKey: vi.fn().mockResolvedValue(''),
    signTransaction: vi.fn().mockResolvedValue({}),
    getNetwork: vi.fn().mockResolvedValue('TESTNET'),
    getNetworkDetails: vi.fn().mockResolvedValue({ network: 'TESTNET' }),
  };
});

afterAll(() => {
  vi.restoreAllMocks();
});
