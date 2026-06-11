import { cn } from '@/lib/workflow';

type StatusBadgeProps = {
  status: string;
  className?: string;
};

const statusStyles: Record<string, string> = {
  ACTIVE: 'bg-[color-mix(in_srgb,var(--color-success)_12%,transparent)] text-[var(--color-success)]',
  ON_HOLD: 'bg-[color-mix(in_srgb,var(--color-warning)_12%,transparent)] text-[var(--color-warning)]',
  PAUSED: 'bg-[var(--color-card-muted)] text-[var(--color-text-muted)]',
  BLOCKED: 'bg-[color-mix(in_srgb,var(--color-error)_12%,transparent)] text-[var(--color-error)]',
  COMPLETED: 'bg-[color-mix(in_srgb,var(--color-success)_12%,transparent)] text-[var(--color-success)]',
  PENDING: 'bg-[var(--color-primary-soft)] text-[var(--color-primary)]',
  IN_PROGRESS: 'bg-[var(--color-primary-soft)] text-[var(--color-primary)]',
  UPCOMING: 'bg-[var(--color-primary-soft)] text-[var(--color-primary)]',
  ON_TREATMENT: 'bg-[var(--color-primary-soft)] text-[var(--color-primary)]',
  POST: 'bg-[var(--color-card-muted)] text-[var(--color-text-muted)]',
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const style = statusStyles[status] ?? 'bg-[var(--color-hover)] text-[var(--color-text-muted)]';
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold whitespace-nowrap',
        style,
        className
      )}
    >
      {status.replace(/_/g, ' ')}
    </span>
  );
}
