import { cn } from '@/lib/workflow';

type StatusBadgeProps = {
  status: string;
  className?: string;
};

const statusStyles: Record<string, string> = {
  ACTIVE: 'bg-[var(--color-badge-success-bg)] text-[var(--color-badge-success-fg)] ring-[var(--color-badge-success-border)]',
  ON_HOLD: 'bg-[var(--color-badge-warning-bg)] text-[var(--color-badge-warning-fg)] ring-[var(--color-badge-warning-border)]',
  PAUSED: 'bg-[var(--color-badge-default-bg)] text-[var(--color-badge-default-fg)] ring-[var(--color-badge-default-border)]',
  BLOCKED: 'bg-[var(--color-badge-error-bg)] text-[var(--color-badge-error-fg)] ring-[var(--color-badge-error-border)]',
  COMPLETED: 'bg-[var(--color-badge-success-bg)] text-[var(--color-badge-success-fg)] ring-[var(--color-badge-success-border)]',
  PENDING: 'bg-[var(--color-badge-primary-bg)] text-[var(--color-badge-primary-fg)] ring-[var(--color-badge-primary-border)]',
  IN_PROGRESS: 'bg-[var(--color-badge-primary-bg)] text-[var(--color-badge-primary-fg)] ring-[var(--color-badge-primary-border)]',
  UPCOMING: 'bg-[var(--color-badge-primary-bg)] text-[var(--color-badge-primary-fg)] ring-[var(--color-badge-primary-border)]',
  ON_TREATMENT: 'bg-[var(--color-badge-primary-bg)] text-[var(--color-badge-primary-fg)] ring-[var(--color-badge-primary-border)]',
  POST: 'bg-[var(--color-badge-default-bg)] text-[var(--color-badge-default-fg)] ring-[var(--color-badge-default-border)]',
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const style = statusStyles[status] ?? 'bg-[var(--color-badge-default-bg)] text-[var(--color-badge-default-fg)] ring-[var(--color-badge-default-border)]';
  return (
    <span
      className={cn(
        'clinical-pill px-2 py-0.5 text-xs ring-1 whitespace-nowrap',
        style,
        className
      )}
    >
      {status.replace(/_/g, ' ')}
    </span>
  );
}
