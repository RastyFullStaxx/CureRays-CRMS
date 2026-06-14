'use client';

import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';
import { AlertTriangle, Search } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { createFacetOptions, type FacetOption } from '@/lib/table-filters';

type PrimitiveCell = string | number | boolean | null | undefined;

type Column<T extends object> = {
  key: string;
  label: string;
  render?: (row: T) => ReactNode;
  width?: string;
};

type DataTableSearch<T extends object> = {
  placeholder: string;
  keys?: Array<keyof T | string>;
  getText?: (row: T) => string;
};

export type DataTableFilter<T extends object> = {
  id: string;
  label: string;
  allLabel?: string;
  options?: FacetOption[];
  getValue?: (row: T) => PrimitiveCell | PrimitiveCell[];
};

type DataTableProps<T extends object> = {
  columns: Column<T>[];
  rows: T[];
  loading?: boolean;
  loadingLabel?: string;
  error?: string;
  empty?: string;
  emptyDescription?: string;
  pageSize?: number;
  keyField?: string;
  onRowClick?: (row: T) => void;
  toolbar?: ReactNode;
  toolbarPrefix?: ReactNode;
  toolbarActions?: ReactNode;
  search?: DataTableSearch<T>;
  filters?: Array<DataTableFilter<T>>;
  className?: string;
};

function cellText(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }

  if (Array.isArray(value)) {
    return value.map(cellText).join(' ');
  }

  if (typeof value === 'object') {
    return '';
  }

  return String(value);
}

function defaultSearchText<T extends object>(row: T, keys?: Array<keyof T | string>) {
  const record = row as Record<string, unknown>;
  const values = keys?.length
    ? keys.map((key) => record[String(key)])
    : Object.values(record);

  return values.map(cellText).join(' ');
}

function rowValues<T extends object>(row: T, filter: DataTableFilter<T>): string[] {
  const rawValue = filter.getValue
    ? filter.getValue(row)
    : (row as Record<string, unknown>)[filter.id];
  const rawValues = Array.isArray(rawValue) ? rawValue : [rawValue];

  return rawValues
    .map(cellText)
    .map((value) => value.trim())
    .filter(Boolean);
}

function rowKey<T extends object>(row: T, keyField: string) {
  const value = (row as Record<string, unknown>)[keyField];
  return typeof value === 'string' || typeof value === 'number' ? value : JSON.stringify(row);
}

function displayCell(value: unknown): ReactNode {
  if (value === null || value === undefined || value === '') {
    return '—';
  }

  if (typeof value === 'string' || typeof value === 'number') {
    return value;
  }

  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }

  return '—';
}

export function DataTable<T extends object>({
  columns,
  rows,
  loading = false,
  loadingLabel = 'Loading records...',
  error,
  empty,
  emptyDescription,
  pageSize = 20,
  keyField = 'id',
  onRowClick,
  toolbar,
  toolbarPrefix,
  toolbarActions,
  search,
  filters = [],
  className = '',
}: DataTableProps<T>) {
  const [query, setQuery] = useState('');
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});

  const activeToolbar = toolbar || search || filters.length > 0 || toolbarPrefix || toolbarActions;

  const filterOptions = useMemo(() => {
    return filters.reduce<Record<string, FacetOption[]>>((optionsById, filter) => {
      optionsById[filter.id] = filter.options ?? createFacetOptions(rows, (row) => rowValues(row, filter));
      return optionsById;
    }, {});
  }, [filters, rows]);

  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return rows.filter((row) => {
      if (normalizedQuery) {
        const text = (search?.getText ? search.getText(row) : defaultSearchText(row, search?.keys)).toLowerCase();
        if (!text.includes(normalizedQuery)) {
          return false;
        }
      }

      return filters.every((filter) => {
        const activeValue = filterValues[filter.id];
        if (!activeValue) {
          return true;
        }

        return rowValues(row, filter).includes(activeValue);
      });
    });
  }, [filterValues, filters, query, rows, search]);

  const hasError = Boolean(error);
  const isEmpty = !loading && !hasError && filteredRows.length === 0;
  const hasActiveFilters = query.trim() || Object.values(filterValues).some(Boolean);
  const viewportRows = pageSize > 0 ? pageSize : undefined;
  const tableViewportHeight = viewportRows
    ? `calc(var(--height-table-header) + (${viewportRows} * var(--height-table-row)))`
    : undefined;

  const clearFilters = () => {
    setQuery('');
    setFilterValues({});
  };

  return (
    <div className={`flex min-h-0 flex-1 flex-col ${className}`} style={{ gap: '10px' }}>
      <div
        className="clinical-surface flex min-h-0 w-full flex-1 flex-col overflow-hidden"
        style={{
          borderRadius: 'var(--radius-lg)',
        }}
      >
        {activeToolbar && (
          <div
            className="shrink-0"
            style={{
              padding: '12px',
              borderBottom: '1px solid var(--color-border-soft)',
              background: 'var(--color-bg-elevated)',
            }}
          >
            {toolbar ?? (
              <div className="flex min-w-0 flex-nowrap items-center overflow-hidden" style={{ gap: 'var(--space-1)' }}>
                {toolbarPrefix ? (
                  <div className="min-w-0 flex-[0_1_150px] [&>*]:!min-w-0">
                    {toolbarPrefix}
                  </div>
                ) : null}
                {search && (
                  <label className="relative min-w-[180px] flex-[2_1_220px]">
                    <Search
                      aria-hidden="true"
                      className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]"
                    />
                    <Input
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder={search.placeholder}
                      className="pl-9"
                      aria-label={search.placeholder}
                    />
                  </label>
                )}
                {filters.map((filter) => (
                  <div key={filter.id} className="min-w-[112px] flex-[1_1_128px]">
                    <Select
                      value={filterValues[filter.id] ?? ''}
                      onChange={(event) => setFilterValues((current) => ({ ...current, [filter.id]: event.target.value }))}
                      aria-label={filter.label}
                    >
                      <option value="">{filter.allLabel ?? `All ${filter.label}`}</option>
                      {(filterOptions[filter.id] ?? []).map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Select>
                  </div>
                ))}
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="clinical-focus h-[var(--height-input)] rounded-[var(--radius-md)] px-3 text-xs font-bold text-[var(--color-primary)] transition hover:bg-[var(--color-hover)]"
                  >
                    Reset
                  </button>
                )}
                {toolbarActions ? <div className="ml-auto flex min-w-0 shrink-[1] grow-0 basis-auto flex-nowrap items-center gap-2 overflow-hidden">{toolbarActions}</div> : null}
              </div>
            )}
          </div>
        )}

        <div
          className="scrollbar-soft min-h-0 w-full overflow-x-auto"
          style={{
            overflowY: isEmpty || loading || hasError ? 'hidden' : 'auto',
            display: 'flex',
            flexDirection: 'column',
            flex: tableViewportHeight ? '0 0 auto' : 1,
            height: tableViewportHeight,
            maxHeight: tableViewportHeight,
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

            {!isEmpty && !loading && !hasError && (
              <tbody>
                {filteredRows.map((row) => (
                  <tr
                    key={rowKey(row, keyField)}
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
                          {col.render ? col.render(row) : displayCell((row as Record<string, unknown>)[col.key])}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            )}
          </table>

          {(isEmpty || loading || hasError) && (
            <div
              role={hasError ? 'alert' : loading ? 'status' : undefined}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transform: 'translateY(-8px)',
              }}
            >
              {hasError ? (
                <EmptyState
                  icon={AlertTriangle}
                  title="Unable to load this table."
                  description={error}
                />
              ) : loading ? (
                <div className="flex flex-col items-center gap-3 text-sm font-semibold text-[var(--color-text-muted)]">
                  <LoadingSpinner size="md" />
                  <span>{loadingLabel}</span>
                </div>
              ) : (
                <EmptyState title={empty} description={emptyDescription} />
              )}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
