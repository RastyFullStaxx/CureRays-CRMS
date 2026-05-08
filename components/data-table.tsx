import type { ReactNode } from "react";

export type DataTableColumn = {
  header: string;
  className?: string;
};

export type DataTableRow = {
  id: string;
  cells: ReactNode[];
};

export function DataTable({
  columns,
  rows,
  minWidth = "920px"
}: {
  columns: DataTableColumn[];
  rows: DataTableRow[];
  minWidth?: string;
}) {
  return (
    <div className="scrollbar-soft overflow-x-auto rounded-lg border border-white/70 bg-white/30">
      <table className="w-full border-collapse" style={{ minWidth }}>
        <thead>
          <tr className="bg-white/50 text-left text-xs font-bold uppercase text-curerays-indigo">
            {columns.map((column) => (
              <th key={column.header} scope="col" className={`px-4 py-3 ${column.className ?? ""}`}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/70">
          {rows.map((row) => (
            <tr key={row.id} className="bg-white/24 transition hover:bg-white/58">
              {row.cells.map((cell, index) => (
                <td key={`${row.id}-${index}`} className="px-4 py-3 align-top text-sm text-curerays-dark-plum">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
