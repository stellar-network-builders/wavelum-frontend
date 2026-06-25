'use client';

import {
  type ButtonHTMLAttributes,
  useState,
  useMemo,
  type ReactNode,
} from 'react';

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
  const [internalPage, setInternalPage] = useState(page ?? 1);
  const currentPage = page ?? internalPage;

  const handlePageChange = (nextPage: number) => {
    setInternalPage(nextPage);
    onPageChange?.(nextPage);
  };

  const handleSort = (columnKey: string) => {
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
  };

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
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize, onPageChange]);

  const totalPages = totalItems
    ? Math.ceil(totalItems / pageSize)
    : Math.ceil(sortedData.length / pageSize);

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
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
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
              paginatedData.map((row, rowIdx) => (
                <tr
                  key={rowIdx}
                  className="transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`px-4 py-3 text-zinc-700 dark:text-zinc-300 ${col.cellClassName ?? ''}`}
                    >
                      {col.render
                        ? col.render(row)
                        : (row[col.key] as ReactNode) ?? '—'}
                    </td>
                  ))}
                </tr>
              ))
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
              onClick={() => handlePageChange(currentPage - 1)}
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
                    onClick={() => handlePageChange(item)}
                    aria-label={`Page ${item}`}
                    aria-current={item === currentPage ? 'page' : undefined}
                  >
                    {item}
                  </PageButton>
                ),
              )}
            <PageButton
              disabled={currentPage >= totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
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

function SortIcon({ direction }: { direction: SortDirection }) {
  return (
    <svg
      width="10"
      height="14"
      viewBox="0 0 10 14"
      fill="none"
      aria-hidden="true"
      className="text-zinc-400"
    >
      <path
        d="M5 0v10M2 4l3-4 3 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={direction === 'asc' ? 'text-zinc-900 dark:text-zinc-50' : ''}
      />
      <path
        d="M5 14V4M2 10l3 4 3-4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={direction === 'desc' ? 'text-zinc-900 dark:text-zinc-50' : ''}
      />
    </svg>
  );
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
} & ButtonHTMLAttributes<HTMLButtonElement>) {
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
