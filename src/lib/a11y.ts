'use client';

import { useEffect, useRef, useCallback } from 'react';

type Priority = 'polite' | 'assertive';

export function announce(message: string, priority: Priority = 'polite') {
  const region = document.getElementById('a11y-announcements');
  if (region) {
    const el = document.createElement('div');
    el.textContent = message;
    if (priority === 'assertive') {
      el.setAttribute('role', 'alert');
    }
    region.appendChild(el);
    setTimeout(() => region.removeChild(el), 3000);
  }
}

export function focusTrap(container: HTMLElement | null) {
  if (!container) return () => {};

  const focusableSelector =
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key !== 'Tab' || !container) return;

    const focusable = container.querySelectorAll<HTMLElement>(focusableSelector);
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  document.addEventListener('keydown', handleKeyDown);
  return () => document.removeEventListener('keydown', handleKeyDown);
}

export function useSkipLink() {
  const skipRef = useRef<HTMLAnchorElement>(null);

  const handleSkip = useCallback((e: React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault();
    const main = document.querySelector('main');
    if (main) {
      main.setAttribute('tabindex', '-1');
      main.focus();
      main.addEventListener(
        'blur',
        () => {
          main.removeAttribute('tabindex');
        },
        { once: true },
      );
    }
  }, []);

  return { skipRef, handleSkip };
}

export function useReducedMotion(): boolean {
  const prefersReducedMotion = useRef(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    prefersReducedMotion.current = mq.matches;

    const handler = (e: MediaQueryListEvent) => {
      prefersReducedMotion.current = e.matches;
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return prefersReducedMotion.current;
}
