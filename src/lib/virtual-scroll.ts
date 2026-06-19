import { useRef, useState, useCallback, useEffect } from 'react';

interface VirtualScrollOptions {
  itemHeight: number;
  overscan?: number;
  totalItems: number;
}

interface VirtualScrollResult {
  containerRef: (node: HTMLDivElement | null) => void;
  visibleItems: { index: number; offsetY: number }[];
  totalHeight: number;
  scrollTo: (index: number) => void;
}

/**
 * Hook that virtualizes a scrollable list, rendering only the items visible
 * in the viewport plus an overscan buffer.
 *
 * @param options - Configuration: `itemHeight`, `overscan` (default 5), and `totalItems`.
 * @returns An object with `containerRef`, `visibleItems` (index + offsetY), `totalHeight`, and `scrollTo`.
 */
export function useVirtualScroll({
  itemHeight,
  overscan = 5,
  totalItems,
}: VirtualScrollOptions): VirtualScrollResult {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);

  const setContainerRef = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      containerRef.current = node;
      setContainerHeight(node.clientHeight);
      const observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
          setContainerHeight(entry.contentRect.height);
        }
      });
      observer.observe(node);
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    function handleScroll() {
      const el = containerRef.current;
      if (el) {
        setScrollTop(el.scrollTop);
      }
    }

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [itemHeight]);

  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    totalItems,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan,
  );

  const visibleItems = [];
  for (let i = startIndex; i < endIndex; i++) {
    visibleItems.push({ index: i, offsetY: i * itemHeight });
  }

  const scrollTo = useCallback((index: number) => {
    containerRef.current?.scrollTo({ top: index * itemHeight, behavior: 'smooth' });
  }, [itemHeight]);

  return {
    containerRef: setContainerRef,
    visibleItems,
    totalHeight: totalItems * itemHeight,
    scrollTo,
  };
}
