import type { ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export type StaticDataTableColumn = {
  header: string;
  key?: string;
  width?: string;
};

export type StaticDataTableRow = {
  id: string;
  cells: ReactNode[];
};

type StaticDataTableProps = {
  columns: StaticDataTableColumn[];
  rows: StaticDataTableRow[];
  empty: string;
  emptyDescription?: string;
  error?: string;
  loading?: boolean;
  loadingLabel?: string;
  compact?: boolean;
  minWidth?: string;
};

export function StaticDataTable({
  columns,
  rows,
  empty,
  emptyDescription,
  error,
  loading = false,
  loadingLabel = 'Loading records...',
  compact = false,
  minWidth,
}: StaticDataTableProps) {
  const stateColSpan = Math.max(columns.length, 1);

  return (
    <div className="clinical-surface overflow-x-auto">
      <table
        className="w-full border-collapse"
        style={minWidth ? { minWidth } : undefined}
      >
        <thead>
          <tr className="text-left text-[11px] font-bold uppercase text-[var(--color-text-muted)]" style={{ background: 'var(--color-table-header-bg)' }}>
            {columns.map((col) => (
              <th
                key={col.header}
                scope="col"
                className={compact ? 'px-3 py-2' : 'px-4 py-3'}
                style={col.width ? { width: col.width } : undefined}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--color-border-soft)]">
          {!loading && !error && rows.map((row) => (
            <tr key={row.id} className="bg-[var(--color-card)] transition hover:bg-[var(--color-table-row-hover)]">
              {row.cells.map((cell, index) => (
                <td
                  key={`${row.id}-${index}`}
                  className={`${compact ? 'px-3 py-2' : 'px-4 py-3'} align-top text-sm font-semibold text-[var(--color-text)]`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
          {(loading || error || rows.length === 0) && (
            <tr>
              <td
                colSpan={stateColSpan}
                className="px-5 py-8 text-center text-sm text-[var(--color-text-muted)]"
              >
                {error ? (
                  <EmptyState icon={AlertTriangle} title="Unable to load this table." description={error} />
                ) : loading ? (
                  <div className="flex flex-col items-center gap-3 text-sm font-semibold text-[var(--color-text-muted)]">
                    <LoadingSpinner size="md" />
                    <span>{loadingLabel}</span>
                  </div>
                ) : (
                  <EmptyState title={empty} description={emptyDescription} />
                )}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
