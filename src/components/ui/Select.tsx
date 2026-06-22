'use client';

import { type ReactNode, useId, useState, useDeferredValue, useMemo } from 'react';
import * as RadixSelect from '@radix-ui/react-select';
import { CaretDown } from '@phosphor-icons/react';

type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

type SelectGroup = {
  label: string;
  options: SelectOption[];
};

type SelectProps = {
  /** Label for the select field. */
  label?: string;
  /** Placeholder shown when nothing is selected. */
  placeholder?: string;
  /** Array of options or grouped options. */
  options: (SelectOption | SelectGroup)[];
  /** Currently selected value. */
  value?: string;
  /** Called when selection changes. */
  onValueChange?: (value: string) => void;
  /** Error message. */
  error?: string;
  /** Whether the select is disabled. */
  disabled?: boolean;
  /** Whether to show a search input for filtering options. */
  searchable?: boolean;
  /** Placeholder text for the search input. */
  searchPlaceholder?: string;
};

/**
 * Accessible select dropdown built on Radix Select.
 *
 * Supports grouped options, search filtering, error state, and dark mode.
 */
export function Select({
  label,
  placeholder = 'Select an option',
  options,
  value,
  onValueChange,
  error,
  disabled = false,
  searchable = false,
  searchPlaceholder = 'Search...',
}: SelectProps) {
  const id = useId();
  const [searchQuery, setSearchQuery] = useState('');
  const deferredSearchQuery = useDeferredValue(searchQuery);

  const filteredOptions = useMemo(
    () => filterOptions(options, deferredSearchQuery),
    [options, deferredSearchQuery]
  );

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={id}
          className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          {label}
        </label>
      )}

      <RadixSelect.Root value={value} onValueChange={onValueChange} disabled={disabled}>
        <RadixSelect.Trigger
          id={id}
          aria-invalid={error ? 'true' : undefined}
          className={[
            'flex h-10 w-full items-center justify-between gap-2 rounded-lg border bg-white px-3 py-2 text-sm',
            'transition-colors duration-150',
            'focus:outline-none focus:ring-2 focus:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error
              ? 'border-red-500 focus:ring-red-400 dark:border-red-400 dark:focus:ring-red-500'
              : 'border-zinc-300 focus:ring-zinc-400 dark:border-zinc-600 dark:focus:ring-zinc-500',
            'dark:bg-zinc-800 dark:text-zinc-100',
          ].join(' ')}
        >
          <RadixSelect.Value placeholder={placeholder} />
          <RadixSelect.Icon>
            <ChevronIcon />
          </RadixSelect.Icon>
        </RadixSelect.Trigger>

        <RadixSelect.Portal>
          <RadixSelect.Content
            position="popper"
            sideOffset={4}
            className="z-50 max-h-60 min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 dark:border-zinc-700 dark:bg-zinc-800"
          >
            {searchable && (
              <div className="border-b border-zinc-200 p-2 dark:border-zinc-700">
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  className="w-full rounded-md border border-zinc-300 bg-white px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-zinc-400 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                  onChange={(e) => {
                    e.stopPropagation();
                    setSearchQuery(e.target.value);
                  }}
                  onKeyDown={(e) => e.stopPropagation()}
                />
              </div>
            )}

            <RadixSelect.Viewport className="p-1">
              {filteredOptions.map((item) => {
                if ('options' in item) {
                  return (
                    <RadixSelect.Group key={item.label}>
                      <RadixSelect.Label className="px-2 py-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                        {item.label}
                      </RadixSelect.Label>
                      {item.options.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value} disabled={opt.disabled}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </RadixSelect.Group>
                  );
                }
                return (
                  <SelectItem key={item.value} value={item.value} disabled={item.disabled}>
                    {item.label}
                  </SelectItem>
                );
              })}
            </RadixSelect.Viewport>
          </RadixSelect.Content>
        </RadixSelect.Portal>
      </RadixSelect.Root>

      {error && (
        <p className="text-xs text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

/** Filter options by search query — case-insensitive. */
function filterOptions(
  options: SelectProps['options'],
  query: string,
): SelectProps['options'] {
  if (!query.trim()) return options;

  const lower = query.toLowerCase();
  return options
    .map((item) => {
      if ('options' in item) {
        const filtered = item.options.filter((opt) =>
          opt.label.toLowerCase().includes(lower),
        );
        return filtered.length > 0 ? { ...item, options: filtered } : null;
      }
      return item.label.toLowerCase().includes(lower) ? item : null;
    })
    .filter(Boolean) as SelectProps['options'];
}

function SelectItem({
  children,
  value,
  disabled,
}: {
  children: ReactNode;
  value: string;
  disabled?: boolean;
}) {
  return (
    <RadixSelect.Item
      value={value}
      disabled={disabled}
      className="relative flex cursor-pointer select-none items-center rounded-md px-2 py-1.5 text-sm text-zinc-700 outline-none transition-colors data-[highlighted]:bg-zinc-100 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 dark:text-zinc-200 dark:data-[highlighted]:bg-zinc-700"
    >
      <RadixSelect.ItemText>{children}</RadixSelect.ItemText>
    </RadixSelect.Item>
  );
}

function ChevronIcon() {
  return <CaretDown className="text-zinc-400 h-3 w-3" weight="bold" />;
}
