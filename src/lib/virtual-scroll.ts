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
 * Virtual scrolling hook for efficiently rendering large lists.
 * Only items that fall within the visible viewport (plus overscan)
 * are tracked, keeping DOM size and paint cost low.
 *
 * @param itemHeight - Fixed pixel height of a single list item.
 * @param overscan   - Number of extra items to render above and below
 *                     the visible region. Defaults to 5.
 * @param totalItems - Total number of items in the logical list.
 * @returns An object with a container callback ref, the visible slice
 *          of items, the total scroll height, and a `scrollTo` helper.
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
