'use client';

import { useEffect, useRef, useCallback } from 'react';

/**
 * Hook that manages focus restoration and initial focus for toggleable
 * UI surfaces like dropdowns, modals, and drawers.
 *
 * @param open - Whether the controlled surface is currently open.
 * @returns Ref setters (`setTriggerRef`, `setContainerRef`) and `containerRef`.
 */
export function useFocusManagement(open: boolean) {
  const triggerRef = useRef<HTMLElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<Element | null>(null);

  const setTriggerRef = useCallback((el: HTMLElement | null) => {
    triggerRef.current = el;
  }, []);

  const setContainerRef = useCallback((el: HTMLDivElement | null) => {
    containerRef.current = el;
  }, []);

  useEffect(() => {
    if (open) {
      previousActiveElement.current = document.activeElement;
      const container = containerRef.current;
      if (container) {
        const firstFocusable = container.querySelector<HTMLElement>(
          'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
        );
        requestAnimationFrame(() => {
          firstFocusable?.focus();
        });
      }
    } else {
      if (previousActiveElement.current instanceof HTMLElement) {
        previousActiveElement.current.focus();
      }
      previousActiveElement.current = null;
    }
  }, [open]);

  return { setTriggerRef, setContainerRef, containerRef };
}
