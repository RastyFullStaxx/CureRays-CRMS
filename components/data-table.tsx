import type { ReactNode } from 'react';

export type DataTableColumn = {
  header: string;
  key?: string;
  width?: string;
};

export type DataTableRow = {
  id: string;
  cells: ReactNode[];
};

export function DataTable({
  columns,
  rows,
  compact = false,
  minWidth,
}: {
  columns: DataTableColumn[];
  rows: DataTableRow[];
  compact?: boolean;
  minWidth?: string;
}) {
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
          {rows.map((row) => (
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
          {rows.length === 0 && (
            <tr>
              <td
                colSpan={columns.length}
                className="px-5 py-8 text-center text-sm text-[var(--color-text-muted)]"
              >
                No records found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
