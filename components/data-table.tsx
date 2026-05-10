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
  minWidth = "920px",
  compact = false
}: {
  columns: DataTableColumn[];
  rows: DataTableRow[];
  minWidth?: string;
  compact?: boolean;
}) {
  return (
    <div className="scrollbar-soft overflow-x-auto rounded-2xl border border-[#D8E4F5] bg-white shadow-[0_8px_24px_rgba(0,51,160,0.06)]">
      <table className="w-full border-collapse" style={{ minWidth }}>
        <thead>
          <tr className="sticky top-0 z-10 bg-[#F8FBFF] text-left text-[11px] font-bold uppercase tracking-wide text-[#3D5A80]">
            {columns.map((column) => (
              <th key={column.header} scope="col" className={`${compact ? "px-3 py-2.5" : "px-4 py-3"} ${column.className ?? ""}`}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E7EEF8]">
          {rows.map((row) => (
            <tr key={row.id} className="bg-white transition hover:bg-[#F8FBFF]">
              {row.cells.map((cell, index) => (
                <td key={`${row.id}-${index}`} className={`${compact ? "px-3 py-2.5" : "px-4 py-3"} align-top text-sm font-medium text-[#061A55]`}>
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
