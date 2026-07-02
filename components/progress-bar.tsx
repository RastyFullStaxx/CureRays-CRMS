import type { ReactNode } from 'react';
import { cn } from '@/lib/workflow';

export function ProgressBar({
  value,
  label,
  tone = 'blue',
  width = 'w-full',
}: {
  value: number;
  label?: ReactNode;
  tone?: 'blue' | 'green' | 'orange' | 'red';
  width?: string;
}) {
  const color =
    tone === 'green'
      ? 'bg-[var(--color-success)]'
      : tone === 'orange'
        ? 'bg-[var(--color-warning)]'
        : tone === 'red'
          ? 'bg-[var(--color-error)]'
          : 'bg-[var(--color-primary)]';
  return (
    <div>
      {label ? (
        <p className="mb-1 type-supporting text-[var(--color-text-muted)]">{label}</p>
      ) : null}
      <div className={cn('h-2 overflow-hidden rounded-full bg-[var(--color-border-soft)]', width)}>
        <div
          className={cn('h-full rounded-full', color)}
          style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
        />
      </div>
    </div>
  );
}
