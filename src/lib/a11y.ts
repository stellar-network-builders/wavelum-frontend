'use client';

import { useEffect, useState, useRef, useCallback } from 'react';

type Priority = 'polite' | 'assertive';

/**
 * Dispatch an accessibility announcement to the screen-reader live region.
 * The message is rendered as a hidden DOM node and removed after 3 seconds.
 *
 * @param message  - Text that should be read by assistive technology.
 * @param priority - "polite" waits for silence; "assertive" interrupts immediately.
 */
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

/**
 * Trap keyboard focus inside a container element (e.g. a modal or drawer).
 * Tab and Shift+Tab cycle through focusable children without escaping.
 *
 * @param container - The DOM element that should contain focus.
 * @returns A cleanup function that removes the key-down listener.
 */
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

/**
 * Hook for a skip-to-content link that moves focus to the `<main>`
 * landmark on activation, making the page immediately keyboard-accessible.
 *
 * @returns A ref for the skip link anchor and a cross-event handler.
 */
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

function getReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Reactively read the user's `prefers-reduced-motion` OS setting.
 *
 * @returns `true` when the user has requested reduced motion, `false` otherwise.
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(getReducedMotion);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return prefersReducedMotion;
}

type Direction = 'horizontal' | 'vertical';
type Orientation = 'rows' | 'cells';

type KeyboardConfig = {
  direction?: Direction;
  orientation?: Orientation;
  columns?: number;
  loop?: boolean;
  onActivate?: (index: number) => void;
};

/**
 * Hook for arrow-key navigation within a container of focusable items.
 * Supports horizontal/vertical modes, row/cell orientations, looping,
 * and an activation callback for Enter/Space.
 *
 * @typeParam T - The element type that receives the container ref.
 * @param itemCount - Total number of navigable items.
 * @param config    - Direction, orientation, columns, loop, and onActivate.
 * @returns The container callback ref, current focused index, and a
 *          programmatic `focusItem` helper.
 */
export function useKeyboardNavigation<T extends HTMLElement>(
  itemCount: number,
  config: KeyboardConfig = {},
) {
  const {
    direction = 'vertical',
    orientation = 'rows',
    columns = 1,
    loop = false,
    onActivate,
  } = config;

  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const containerRef = useRef<T>(null);

  const getItems = useCallback(() => {
    if (!containerRef.current) return [];
    return containerRef.current.querySelectorAll<HTMLElement>(
      '[role="listitem"], [role="option"], [role="row"], [role="gridcell"], [tabindex]:not([tabindex="-1"])',
    );
  }, []);

  const focusItem = useCallback((index: number) => {
    const items = getItems();
    if (items[index]) {
      items[index].focus();
      setFocusedIndex(index);
    }
  }, [getItems]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const items = getItems();
    if (items.length === 0) return;

    let nextIndex = focusedIndex;

    switch (e.key) {
      case 'ArrowDown':
        if (direction === 'vertical') {
          e.preventDefault();
          nextIndex = focusedIndex + columns;
        }
        break;
      case 'ArrowUp':
        if (direction === 'vertical') {
          e.preventDefault();
          nextIndex = focusedIndex - columns;
        }
        break;
      case 'ArrowRight':
        if (direction === 'horizontal' || orientation === 'cells') {
          e.preventDefault();
          nextIndex = focusedIndex + 1;
        }
        break;
      case 'ArrowLeft':
        if (direction === 'horizontal' || orientation === 'cells') {
          e.preventDefault();
          nextIndex = focusedIndex - 1;
        }
        break;
      case 'Home':
        e.preventDefault();
        nextIndex = 0;
        break;
      case 'End':
        e.preventDefault();
        nextIndex = itemCount - 1;
        break;
      case 'Enter':
      case ' ':
        if (focusedIndex >= 0) {
          e.preventDefault();
          onActivate?.(focusedIndex);
        }
        return;
      default:
        return;
    }

    if (loop) {
      if (nextIndex < 0) nextIndex = itemCount - 1;
      else if (nextIndex >= itemCount) nextIndex = 0;
    } else {
      nextIndex = Math.max(0, Math.min(nextIndex, itemCount - 1));
    }

    if (nextIndex !== focusedIndex) {
      focusItem(nextIndex);
    }
  }, [focusedIndex, direction, orientation, columns, loop, itemCount, onActivate, getItems, focusItem]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('keydown', handleKeyDown);
    return () => container.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const setContainerRef = useCallback((el: T | null) => {
    containerRef.current = el;
  }, []);

  return { containerRef: setContainerRef, focusedIndex, focusItem };
}
