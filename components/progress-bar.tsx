import type { ReactNode } from 'react';
import { cn } from '@/lib/workflow';
import { statusToneToken, type StatusTone } from '@/lib/status-utils';

export function ProgressBar({
  value,
  label,
  tone = 'neutral',
  width = 'w-full',
}: {
  value: number;
  label?: ReactNode;
  tone?: StatusTone;
  width?: string;
}) {
  return (
    <div>
      {label ? (
        <p className="mb-1 type-supporting text-[var(--color-text-muted)]">{label}</p>
      ) : null}
      <div className={cn('h-2 overflow-hidden rounded-full bg-[var(--color-border-soft)]', width)}>
        <div
          className="h-full rounded-full"
          style={{
            background: statusToneToken(tone),
            width: `${Math.min(Math.max(value, 0), 100)}%`,
          }}
        />
      </div>
    </div>
  );
}
