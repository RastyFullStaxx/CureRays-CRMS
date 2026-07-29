'use client';

import { useMemo } from 'react';
import type { CSSProperties } from 'react';
import type { PaletteTone } from '@/components/shared/use-status-palette';

export type ClinicalMatrixDatum = {
  x: number;
  y: number;
  value: number;
  tone: PaletteTone;
  detail: string;
};

function matrixGridStyle(columnCount: number): CSSProperties {
  return {
    gridTemplateColumns: `minmax(104px, 0.72fr) repeat(${columnCount}, minmax(30px, 1fr))`,
  };
}

export function ClinicalMatrix({
  ariaLabel,
  columns,
  rows,
  cells,
}: {
  ariaLabel: string;
  columns: string[];
  rows: string[];
  cells: ClinicalMatrixDatum[];
}) {
  const cellMap = useMemo(() => {
    const next = new Map<string, ClinicalMatrixDatum>();
    cells.forEach((cell) => next.set(`${cell.x}:${cell.y}`, cell));
    return next;
  }, [cells]);

  return (
    <div className="clinical-matrix" role="table" aria-label={ariaLabel}>
      <div className="clinical-matrix-grid" style={matrixGridStyle(columns.length)}>
        <span className="clinical-matrix-corner" aria-hidden="true" />
        {columns.map((column) => (
          <span key={column} className="clinical-matrix-column-label">
            {column}
          </span>
        ))}
        {rows.map((row, y) => (
          <div key={row} className="clinical-matrix-row" role="row">
            <span className="clinical-matrix-row-label">{row}</span>
            {columns.map((column, x) => {
              const cell = cellMap.get(`${x}:${y}`) ?? {
                x,
                y,
                value: 0,
                tone: 'neutral' as PaletteTone,
                detail: `${row} · ${column}: no open signal`,
              };

              return (
                <span
                  key={`${row}-${column}`}
                  className="clinical-matrix-cell"
                  data-empty={cell.value === 0 ? 'true' : 'false'}
                  data-tone={cell.tone}
                  title={cell.detail}
                  aria-label={cell.detail}
                >
                  {cell.value > 0 ? cell.value : ''}
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
