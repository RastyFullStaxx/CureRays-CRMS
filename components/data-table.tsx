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
    <div className="overflow-x-auto rounded-lg border border-white/70 bg-white/52">
      <table
        className="w-full border-collapse"
        style={minWidth ? { minWidth } : undefined}
      >
        <thead>
          <tr className="bg-white/42 text-left text-xs font-bold uppercase text-curerays-indigo">
            {columns.map((col) => (
              <th
                key={col.header}
                scope="col"
                className={compact ? 'px-3 py-2' : 'px-5 py-3'}
                style={col.width ? { width: col.width } : undefined}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/70">
          {rows.map((row) => (
            <tr key={row.id} className="bg-white/28 transition hover:bg-white/58">
              {row.cells.map((cell, index) => (
                <td
                  key={`${row.id}-${index}`}
                  className={`${compact ? 'px-3 py-2' : 'px-5 py-4'} align-top text-sm font-semibold text-curerays-dark-plum`}
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
                className="px-5 py-8 text-center text-sm text-curerays-indigo"
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
