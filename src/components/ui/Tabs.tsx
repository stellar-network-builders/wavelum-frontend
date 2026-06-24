'use client';

import * as TabsPrimitive from '@radix-ui/react-tabs';
import { type ReactNode, useRef, useState, useEffect, useCallback } from 'react';

type Tab = {
  value: string;
  label: string;
  content: ReactNode;
  disabled?: boolean;
};

type TabsProps = {
  /** Array of tab definitions. */
  tabs: Tab[];
  /** Currently active tab value. */
  value?: string;
  /** Called when the active tab changes. */
  onValueChange?: (value: string) => void;
  /** Default active tab. */
  defaultValue?: string;
};

/**
 * Accessible tab component built on Radix Tabs with animated indicator.
 */
export function Tabs({
  tabs,
  value,
  onValueChange,
  defaultValue,
}: TabsProps) {
  const [activeValue, setActiveValue] = useState(value ?? defaultValue ?? tabs[0]?.value ?? '');
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const listRef = useRef<HTMLDivElement>(null);

  const currentValue = value ?? activeValue;

  const updateIndicator = useCallback(
    (val: string) => {
      if (!listRef.current) return;
      const activeTrigger = listRef.current.querySelector<HTMLElement>(
        `[data-tab-value="${val}"]`,
      );
      if (activeTrigger) {
        const { offsetLeft, offsetWidth } = activeTrigger;
        setIndicatorStyle({ left: offsetLeft, width: offsetWidth });
      }
    },
    [],
  );

  useEffect(() => {
    updateIndicator(currentValue);
  }, [currentValue, tabs, updateIndicator]);

  return (
    <TabsPrimitive.Root
      value={currentValue}
      onValueChange={(v) => {
        setActiveValue(v);
        onValueChange?.(v);
      }}
      defaultValue={defaultValue}
    >
      <TabsPrimitive.List
        ref={listRef}
        className="relative flex gap-0 border-b border-zinc-200 dark:border-zinc-800"
        aria-label="Tabs"
      >
        {tabs.map((tab) => (
          <TabsPrimitive.Trigger
            key={tab.value}
            value={tab.value}
            disabled={tab.disabled}
            data-tab-value={tab.value}
            className={[
              'relative px-4 py-2.5 text-sm font-medium transition-colors',
              'text-zinc-500 hover:text-zinc-700',
              'disabled:pointer-events-none disabled:opacity-50',
              'data-[state=active]:text-zinc-900',
              'dark:text-zinc-400 dark:hover:text-zinc-200',
              'dark:data-[state=active]:text-zinc-50',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2',
            ].join(' ')}
          >
            {tab.label}
          </TabsPrimitive.Trigger>
        ))}

        {/* Animated indicator */}
        <div
          role="presentation"
          className="absolute bottom-0 h-0.5 rounded-full bg-zinc-900 transition-all duration-200 ease-out dark:bg-zinc-50"
          style={{ left: indicatorStyle.left, width: indicatorStyle.width }}
        />
      </TabsPrimitive.List>

      {tabs.map((tab) => (
        <TabsPrimitive.Content
          key={tab.value}
          value={tab.value}
          className="pt-4 focus-visible:outline-none"
        >
          {tab.content}
        </TabsPrimitive.Content>
      ))}
    </TabsPrimitive.Root>
  );
}
