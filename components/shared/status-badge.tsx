import { cn } from '@/lib/workflow';

type StatusBadgeProps = {
  status: string;
  className?: string;
};

const statusStyles: Record<string, string> = {
  ACTIVE: 'bg-emerald-50 text-emerald-700',
  ON_HOLD: 'bg-amber-50 text-amber-700',
  PAUSED: 'bg-slate-50 text-slate-600',
  BLOCKED: 'bg-red-50 text-red-700',
  COMPLETED: 'bg-emerald-50 text-emerald-700',
  PENDING: 'bg-blue-50 text-blue-700',
  IN_PROGRESS: 'bg-blue-50 text-blue-700',
  UPCOMING: 'bg-blue-50 text-blue-700',
  ON_TREATMENT: 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]',
  POST: 'bg-slate-50 text-slate-600',
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
