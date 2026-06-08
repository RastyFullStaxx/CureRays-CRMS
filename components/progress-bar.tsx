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
      ? 'bg-emerald-500'
      : tone === 'orange'
        ? 'bg-[#F59E0B]'
        : tone === 'red'
          ? 'bg-rose-500'
          : 'bg-[#0033A0]';
  return (
    <div>
      {label ? (
        <p className="mb-1 text-xs font-bold text-curerays-indigo">{label}</p>
      ) : null}
      <div className={cn('h-2 overflow-hidden rounded-full bg-[#E7EEF8]', width)}>
        <div
          className={cn('h-full rounded-full', color)}
          style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
        />
      </div>
    </div>
  );
}
