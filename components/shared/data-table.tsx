'use client';

import type { ReactNode } from 'react';
import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { EmptyState } from '@/components/ui/empty-state';

type Column = {
  key: string;
  label: string;
  render?: (row: Record<string, any>) => ReactNode;
  width?: string;
};

type DataTableProps = {
  columns: Column[];
  rows: Record<string, any>[];
  loading?: boolean;
  empty?: string;
  pageSize?: number;
  keyField?: string;
  onRowClick?: (row: Record<string, any>) => void;
  toolbar?: ReactNode;
  className?: string;
};

export function DataTable({
  columns,
  rows,
  loading = false,
  empty = 'No records found.',
  pageSize = 20,
  keyField = 'id',
  onRowClick,
  toolbar,
  className = '',
}: DataTableProps) {
  const [page, setPage] = useState(1);

  const paginated = pageSize > 0
    ? rows.slice((page - 1) * pageSize, page * pageSize)
    : rows;

  const totalPages = pageSize > 0
    ? Math.max(1, Math.ceil(rows.length / pageSize))
    : 1;

  const showPagination = pageSize > 0 && rows.length > pageSize;
  const isEmpty = !loading && paginated.length === 0;

  return (
    <div className={`flex min-h-0 flex-1 flex-col ${className}`} style={{ gap: '10px' }}>
      <div
        className="clinical-surface flex min-h-0 w-full flex-1 flex-col overflow-hidden"
        style={{
          borderRadius: 'var(--radius-lg)',
        }}
      >
        {toolbar && (
          <div
            className="shrink-0"
            style={{
              padding: '12px',
              borderBottom: '1px solid var(--color-border-soft)',
              background: 'var(--color-bg-elevated)',
            }}
          >
            {toolbar}
          </div>
        )}

        <div
          className="flex-1 min-h-0 w-full overflow-x-auto"
          style={{
            overflowY: isEmpty || loading ? 'hidden' : 'auto',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <table className="w-full border-collapse" style={{ flexShrink: 0 }}>
            <thead className="sticky top-0 z-10" style={{ background: 'var(--color-table-header-bg)' }}>
              <tr
                style={{
                  height: 'var(--height-table-header)',
                  borderBottom: '1px solid var(--color-border-soft)',
                }}
              >
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className="text-left font-semibold whitespace-nowrap"
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '11px',
                      paddingLeft: '14px',
                      paddingRight: '14px',
                      width: col.width,
                      color: 'var(--color-text-muted)',
                      textTransform: 'uppercase',
                      letterSpacing: 0,
                    }}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>

            {!isEmpty && !loading && (
              <tbody>
                {paginated.map((row) => (
                  <tr
                    key={row[keyField] ?? JSON.stringify(row)}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    className={[
                      'last:border-b-0',
                      'transition-colors duration-100',
                      onRowClick ? 'cursor-pointer hover:bg-[var(--color-table-row-hover)]' : 'hover:bg-[var(--color-table-row-hover)]',
                    ].join(' ')}
                    style={{
                      height: 'var(--height-table-row)',
                      borderBottom: '1px solid var(--color-border-soft)',
                      fontFamily: 'var(--font-body)',
                      color: 'var(--color-text)',
                    }}
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        style={{
                          fontSize: 'var(--font-size-small)',
                          paddingLeft: '14px',
                          paddingRight: '14px',
                        }}
                      >
                        <div className="min-w-0 overflow-hidden">
                          {col.render ? col.render(row) : row[col.key] ?? '—'}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            )}
          </table>

          {(isEmpty || loading) && (
            <div
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transform: 'translateY(-8px)',
              }}
            >
              {loading ? (
                <LoadingSpinner size="md" />
              ) : (
                <EmptyState title={empty} />
              )}
            </div>
          )}
        </div>
      </div>

      {showPagination && (
        <div
            className="flex items-center justify-between shrink-0"
          style={{ paddingLeft: 'var(--space-1)', paddingRight: 'var(--space-1)' }}
        >
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--font-size-small)', color: 'var(--color-text-muted)' }}>
            Showing {((page - 1) * pageSize) + 1}–{Math.min(page * pageSize, rows.length)} of {rows.length}
          </p>
          <div className="flex items-center" style={{ gap: 'var(--space-1)' }}>
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              aria-label="Previous page"
              className="clinical-focus flex h-8 w-8 items-center justify-center text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-hover)] disabled:cursor-not-allowed disabled:opacity-30"
              style={{ borderRadius: 'var(--radius-md)' }}
            >
              <ChevronLeft size={16} />
            </button>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--font-size-small)', color: 'var(--color-text)', paddingLeft: 'var(--space-1)', paddingRight: 'var(--space-1)' }}>
              {page} / {totalPages}
            </span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              aria-label="Next page"
              className="clinical-focus flex h-8 w-8 items-center justify-center text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-hover)] disabled:cursor-not-allowed disabled:opacity-30"
              style={{ borderRadius: 'var(--radius-md)' }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
