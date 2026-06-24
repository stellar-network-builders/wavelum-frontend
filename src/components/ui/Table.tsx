'use client';

import { CaretUp, CaretDown, ArrowsDownUp } from '@phosphor-icons/react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useState, useMemo, useCallback, useRef, memo, type ReactNode, type ReactElement } from 'react';

type SortDirection = 'asc' | 'desc' | null;

type Column<T> = {
  /** Unique key matching a field in the data. */
  key: string;
  /** Header label. */
  label: string;
  /** Whether this column is sortable. */
  sortable?: boolean;
  /** Custom render function for the cell. Receives the row data. */
  render?: (row: T) => ReactNode;
  /** Additional classes for the header cell. */
  headerClassName?: string;
  /** Additional classes for the data cell. */
  cellClassName?: string;
};

type TableProps<T> = {
  /** Column definitions. */
  columns: Column<T>[];
  /** Array of data rows. */
  data: T[];
  /** Whether data is loading (shows skeleton rows). */
  loading?: boolean;
  /** Number of skeleton rows to show while loading. */
  skeletonRowCount?: number;
  /** Content to show when data is empty. */
  emptyState?: ReactNode;
  /** Default sort column key. */
  defaultSortColumn?: string;
  /** Default sort direction. */
  defaultSortDirection?: SortDirection;
  /** Current page (1-indexed). */
  page?: number;
  /** Number of rows per page. */
  pageSize?: number;
  /** Total item count (for server-side pagination). */
  totalItems?: number;
  /** Called when page changes. */
  onPageChange?: (page: number) => void;
  /** Called when sort changes. */
  onSortChange?: (column: string, direction: SortDirection) => void;
};

/**
 * Data table with sortable columns, loading skeletons, empty state, and pagination.
 *
 * Supports both client-side and server-side sorting/pagination via callbacks.
 */
export function Table<T extends Record<string, unknown>>({
  columns,
  data,
  loading = false,
  skeletonRowCount = 5,
  emptyState,
  defaultSortColumn,
  defaultSortDirection = null,
  page,
  pageSize = 10,
  totalItems,
  onPageChange,
  onSortChange,
}: TableProps<T>) {
  const [sortColumn, setSortColumn] = useState<string | null>(defaultSortColumn ?? null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(defaultSortDirection);

  const handleSort = useCallback((columnKey: string) => {
    const column = columns.find((c) => c.key === columnKey);
    if (!column?.sortable) return;

    let newDir: SortDirection;
    if (sortColumn !== columnKey) {
      newDir = 'asc';
    } else {
      newDir = sortDirection === 'asc' ? 'desc' : sortDirection === 'desc' ? null : 'asc';
    }

    setSortColumn(newDir ? columnKey : null);
    setSortDirection(newDir);
    onSortChange?.(columnKey, newDir);
  }, [columns, sortColumn, sortDirection, onSortChange]);

  // Client-side sorting when callbacks aren't used
  const sortedData = useMemo(() => {
    if (onSortChange) return data; // Server-side — don't sort locally
    if (!sortColumn || !sortDirection) return data;

    return [...data].sort((a, b) => {
      const aVal = a[sortColumn];
      const bVal = b[sortColumn];

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      if (aVal == null) return 1;
      if (bVal == null) return -1;
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortColumn, sortDirection, onSortChange]);

  // Client-side pagination when callbacks aren't used
  const paginatedData = useMemo(() => {
    if (onPageChange || !pageSize) return sortedData;
    const start = ((page ?? 1) - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, page, pageSize, onPageChange]);

  const totalPages = totalItems
    ? Math.ceil(totalItems / pageSize)
    : Math.ceil(sortedData.length / pageSize);

  const currentPage = page ?? 1;

  // ------------------------------------------------------------------
  // Virtual Scrolling Setup
  // ------------------------------------------------------------------
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: paginatedData.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 44, // approx row height
    overscan: 5,
  });

  const virtualItems = virtualizer.getVirtualItems();

  const paddingTop = virtualItems.length > 0 ? virtualItems[0].start : 0;
  const paddingBottom = virtualItems.length > 0
    ? virtualizer.getTotalSize() - virtualItems[virtualItems.length - 1].end
    : 0;

  // ------------------------------------------------------------------
  // Empty state
  // ------------------------------------------------------------------
  if (!loading && data.length === 0 && emptyState) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-zinc-200 bg-white px-6 py-12 text-center dark:border-zinc-800 dark:bg-zinc-900">
        {emptyState}
      </div>
    );
  }

  // ------------------------------------------------------------------
  // Table
  // ------------------------------------------------------------------
  return (
    <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
      <div className="overflow-auto max-h-[600px]" ref={parentRef}>
        <table className="w-full text-left text-sm relative">
          <thead className="sticky top-0 z-10 bg-zinc-50 dark:bg-zinc-900">
            <tr className="border-b border-zinc-200 dark:border-zinc-800">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 font-medium text-zinc-500 dark:text-zinc-400 ${col.headerClassName ?? ''} ${
                    col.sortable ? 'cursor-pointer select-none hover:text-zinc-700 dark:hover:text-zinc-200' : ''
                  }`}
                  onClick={() => handleSort(col.key)}
                  aria-sort={
                    sortColumn === col.key
                      ? sortDirection === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : undefined
                  }
                >
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    {col.sortable && sortColumn === col.key && (
                      <SortIcon direction={sortDirection ?? 'asc'} />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-zinc-200 bg-white dark:divide-zinc-800 dark:bg-zinc-900">
            {loading ? (
              Array.from({ length: skeletonRowCount }).map((_, i) => (
                <tr key={i}>
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3">
                      <span className="block h-4 w-3/4 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
                    </td>
                  ))}
                </tr>
              ))
            ) : paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-12 text-center text-zinc-500 dark:text-zinc-400"
                >
                  No results found
                </td>
              </tr>
            ) : (
              <>
                {paddingTop > 0 && (
                  <tr>
                    <td style={{ height: paddingTop }} colSpan={columns.length} />
                  </tr>
                )}
                {virtualItems.map((virtualRow) => {
                  const row = paginatedData[virtualRow.index];
                  return (
                    <MemoizedTableRow
                      key={virtualRow.key}
                      row={row}
                      columns={columns}
                      dataIndex={virtualRow.index}
                      measureRef={virtualizer.measureElement}
                    />
                  );
                })}
                {paddingBottom > 0 && (
                  <tr>
                    <td style={{ height: paddingBottom }} colSpan={columns.length} />
                  </tr>
                )}
              </>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Page {currentPage} of {totalPages}
            {totalItems !== undefined && ` (${totalItems} total items)`}
          </p>
          <div className="flex items-center gap-1">
            <PageButton
              disabled={currentPage <= 1}
              onClick={() => onPageChange?.(currentPage - 1)}
              aria-label="Previous page"
            >
              ‹
            </PageButton>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(
                (p) =>
                  p === 1 ||
                  p === totalPages ||
                  Math.abs(p - currentPage) <= 1,
              )
              .reduce<(number | 'ellipsis')[]>((acc, p, idx, arr) => {
                if (idx > 0 && p - (arr[idx - 1] as number) > 1) {
                  acc.push('ellipsis');
                }
                acc.push(p);
                return acc;
              }, [])
              .map((item, idx) =>
                item === 'ellipsis' ? (
                  <span
                    key={`e-${idx}`}
                    className="px-2 text-xs text-zinc-400"
                  >
                    …
                  </span>
                ) : (
                  <PageButton
                    key={item}
                    active={item === currentPage}
                    onClick={() => onPageChange?.(item)}
                  >
                    {item}
                  </PageButton>
                ),
              )}
            <PageButton
              disabled={currentPage >= totalPages}
              onClick={() => onPageChange?.(currentPage + 1)}
              aria-label="Next page"
            >
              ›
            </PageButton>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

const MemoizedTableRow = memo(function MemoizedTableRow<T>({
  row,
  columns,
  dataIndex,
  measureRef,
}: {
  row: T;
  columns: Column<T>[];
  dataIndex: number;
  measureRef: (node: Element | null) => void;
}) {
  return (
    <tr
      ref={measureRef}
      data-index={dataIndex}
      className="transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
    >
      {columns.map((col) => (
        <td
          key={col.key}
          className={`px-4 py-3 text-zinc-700 dark:text-zinc-300 ${col.cellClassName ?? ''}`}
        >
          {col.render
            ? col.render(row)
            : (row[col.key as keyof T] as ReactNode) ?? '—'}
        </td>
      ))}
    </tr>
  );
}) as <T>(props: {
  row: T;
  columns: Column<T>[];
  dataIndex: number;
  measureRef: (node: Element | null) => void;
}) => ReactElement;


function SortIcon({ direction }: { direction: SortDirection }) {
  if (direction === 'asc') return <CaretUp className="text-zinc-900 dark:text-zinc-50 h-3 w-3" weight="bold" />;
  if (direction === 'desc') return <CaretDown className="text-zinc-900 dark:text-zinc-50 h-3 w-3" weight="bold" />;
  return <ArrowsDownUp className="text-zinc-400 h-3 w-3" />;
}

function PageButton({
  children,
  disabled,
  active,
  ...rest
}: {
  children: ReactNode;
  disabled?: boolean;
  active?: boolean;
  [key: string]: unknown;
}) {
  return (
    <button
      disabled={disabled}
      className={[
        'inline-flex h-7 w-7 items-center justify-center rounded text-xs font-medium transition-colors',
        active
          ? 'bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900'
          : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800',
        'disabled:pointer-events-none disabled:opacity-40',
      ].join(' ')}
      {...rest}
    >
      {children}
    </button>
  );
}
