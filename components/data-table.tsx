import type { ReactNode } from "react";

export type DataTableColumn = {
  header: string;
  className?: string;
  priority?: "primary" | "secondary" | "optional";
};

export type DataTableRow = {
  id: string;
  cells: ReactNode[];
};

export function DataTable({
  columns,
  rows,
  minWidth,
  compact = false,
  footer
}: {
  columns: DataTableColumn[];
  rows: DataTableRow[];
  minWidth?: string;
  compact?: boolean;
  footer?: ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-[#D8E4F5] bg-white shadow-[0_8px_24px_rgba(0,51,160,0.05)]">
      <div className="scrollbar-soft overflow-x-auto">
        <table className="w-full table-fixed border-collapse" style={minWidth ? { minWidth } : undefined}>
          <thead>
            <tr className="bg-[#F8FBFF] text-left text-[10px] font-bold uppercase tracking-wide text-[#3D5A80]">
              {columns.map((column) => (
                <th key={column.header} scope="col" className={`${compact ? "px-3 py-2.5" : "px-4 py-3"} ${column.className ?? ""}`}>
                  <span className="block truncate">{column.header}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E7EEF8]">
            {rows.map((row) => (
              <tr key={row.id} className="bg-white transition hover:bg-[#F8FBFF]">
                {row.cells.map((cell, index) => (
                  <td key={`${row.id}-${index}`} className={`${compact ? "px-3 py-2.5" : "px-4 py-3"} align-middle text-xs font-semibold leading-5 text-[#061A55]`}>
                    <div className="min-w-0 overflow-hidden">{cell}</div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {footer ? <div className="border-t border-[#E7EEF8] bg-white px-3 py-2.5">{footer}</div> : null}
    </div>
  );
}
