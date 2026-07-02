'use client';

import type { ReactNode } from 'react';
import { Flag, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import { DataTable, type DataTableFilter } from '@/components/shared/data-table';
import { PrototypeActionButton } from '@/components/shared/prototype-action-button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/workflow';
import { mapTone } from '@/lib/status-utils';

type SerializableCell = string | number | boolean | null | undefined | string[];
export type SerializedTableRow = Record<string, SerializableCell> & { id: string };

type SerializedAction = {
  label: string;
  icon?: 'calendar' | 'check' | 'download' | 'eye' | 'file' | 'pen' | 'play' | 'plus' | 'refresh' | 'settings' | 'upload' | 'wallet';
  kind?: 'create' | 'document' | 'export' | 'review' | 'schedule' | 'settings' | 'upload';
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'default' | 'sm';
  description?: string;
  descriptionKey?: string;
  href?: string;
  hrefKey?: string;
};

export type SerializedColumn = {
  key: string;
  label: string;
  kind?: 'actions' | 'badge' | 'date' | 'flag' | 'icon' | 'longText' | 'muted' | 'primary' | 'progress' | 'status' | 'text';
  subKey?: string;
  toneKey?: string;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'primary';
  width?: string;
  suffix?: string;
  actions?: SerializedAction[];
};

export type SerializedFilter = {
  id: string;
  label: string;
  key?: string;
  allLabel?: string;
};

type SerializedDataTableProps = {
  columns: SerializedColumn[];
  rows: SerializedTableRow[];
  empty: string;
  emptyDescription?: string;
  pageSize?: number;
  keyField?: string;
  search?: {
    placeholder: string;
    keys: string[];
  };
  filters?: SerializedFilter[];
  toolbarPrefix?: ReactNode;
  toolbarActions?: ReactNode;
  className?: string;
};

function cellText(value: SerializableCell) {
  if (value === null || value === undefined || value === '') return '—';
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  return String(value);
}

function renderCell(row: SerializedTableRow, column: SerializedColumn) {
  const value = row[column.key];
  const text = cellText(value);

  if (column.kind === 'actions') {
    return (
      <span className="flex min-w-0 flex-wrap gap-2">
        {(column.actions ?? []).map((action) => {
          const href = action.href ?? (action.hrefKey ? cellText(row[action.hrefKey]) : undefined);
          const description = action.descriptionKey ? cellText(row[action.descriptionKey]) : action.description;

          if (href && href !== '—') {
            return (
              <Link
                key={action.label}
                href={href}
                className={cn(
                  'clinical-focus inline-flex items-center justify-center rounded-[var(--radius-md)] border type-medium transition',
                  action.size === 'default' ? 'h-[var(--height-btn)] px-4 type-body' : 'h-[var(--height-btn-sm)] px-3 type-supporting',
                  action.variant === 'primary'
                    ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-primary-foreground)] hover:bg-[var(--color-primary-dark)]'
                    : 'border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-primary)] hover:border-[var(--color-primary)]/30 hover:bg-[var(--color-primary-soft)]',
                )}
              >
                {action.label}
              </Link>
            );
          }

          return (
            <PrototypeActionButton
              key={action.label}
              label={action.label}
              icon={action.icon}
              kind={action.kind}
              variant={action.variant}
              size={action.size ?? 'sm'}
              description={description}
            />
          );
        })}
      </span>
    );
  }

  if (column.kind === 'badge') {
    return <Badge variant={column.variant ?? 'default'}>{text}</Badge>;
  }

  if (column.kind === 'status') {
    return <Badge variant={mapTone(cellText(row[column.toneKey ?? `${column.key}Tone`]))}>{text}</Badge>;
  }

  if (column.kind === 'primary') {
    return (
      <span className="flex min-w-0 flex-col">
        <span className="truncate type-medium text-[var(--color-primary)]">{text}</span>
        {column.subKey ? <span className="truncate type-supporting text-[var(--color-text-muted)]">{cellText(row[column.subKey])}</span> : null}
      </span>
    );
  }

  if (column.kind === 'muted') {
    return <span className="block truncate text-[var(--color-text-muted)]">{text}</span>;
  }

  if (column.kind === 'longText') {
    return <span className="line-clamp-2 text-[var(--color-text-muted)]">{text}</span>;
  }

  if (column.kind === 'date') {
    return text === '—' ? '—' : new Date(text).toLocaleDateString();
  }

  if (column.kind === 'flag') {
    return value ? <Flag className="h-4 w-4 text-[var(--color-error)]" aria-hidden="true" /> : <span className="text-[var(--color-text-muted)]">—</span>;
  }

  if (column.kind === 'icon') {
    return (
      <span className="grid h-10 w-10 place-items-center rounded-[var(--radius-md)]" style={{ background: 'color-mix(in srgb, var(--color-primary) 9%, var(--color-card))', color: 'var(--color-primary)' }}>
        <ImageIcon className="h-5 w-5" aria-hidden="true" />
      </span>
    );
  }

  if (column.kind === 'progress') {
    const numeric = typeof value === 'number' ? value : Number(value ?? 0);
    const clamped = Math.max(0, Math.min(100, Number.isFinite(numeric) ? numeric : 0));
    return (
      <div className="flex min-w-[120px] items-center gap-2">
        <div className="h-2 flex-1 rounded-full bg-[var(--color-border-soft)]">
          <div
            className="h-full rounded-full"
            style={{
              width: `${clamped}%`,
              background: clamped > 85 ? 'var(--color-success)' : clamped > 70 ? 'var(--color-warning)' : 'var(--color-error)',
            }}
          />
        </div>
        <span className="type-supporting text-[var(--color-text-muted)]">{clamped}%</span>
      </div>
    );
  }

  return column.suffix && text !== '—' ? `${text} ${column.suffix}` : text;
}

export function SerializedDataTable({
  columns,
  rows,
  empty,
  emptyDescription,
  pageSize = 10,
  keyField = 'id',
  search,
  filters = [],
  toolbarPrefix,
  toolbarActions,
  className,
}: SerializedDataTableProps) {
  const tableFilters: Array<DataTableFilter<SerializedTableRow>> = filters.map((filter) => ({
    id: filter.id,
    label: filter.label,
    allLabel: filter.allLabel,
    getValue: (row) => row[filter.key ?? filter.id],
  }));

  return (
    <DataTable
      keyField={keyField}
      columns={columns.map((column) => ({
        key: column.key,
        label: column.label,
        width: column.width,
        render: (row: SerializedTableRow) => renderCell(row, column),
      }))}
      rows={rows}
      empty={empty}
      emptyDescription={emptyDescription}
      pageSize={pageSize}
      search={search ? {
        placeholder: search.placeholder,
        getText: (row) => search.keys.map((key) => cellText(row[key])).join(' '),
      } : undefined}
      filters={tableFilters}
      toolbarPrefix={toolbarPrefix}
      toolbarActions={toolbarActions}
      className={className}
    />
  );
}
