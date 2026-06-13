import { cn } from '@/lib/workflow';

type StatusBadgeProps = {
  status: string;
  className?: string;
};

const statusStyles: Record<string, string> = {
  ACTIVE: 'clinical-pill-success',
  ON_HOLD: 'clinical-pill-warning',
  PAUSED: 'clinical-pill-default',
  BLOCKED: 'clinical-pill-error',
  COMPLETED: 'clinical-pill-success',
  PENDING: 'clinical-pill-primary',
  IN_PROGRESS: 'clinical-pill-primary',
  UPCOMING: 'clinical-pill-primary',
  ON_TREATMENT: 'clinical-pill-primary',
  POST: 'clinical-pill-default',
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const style = statusStyles[status] ?? 'clinical-pill-default';
  return (
    <span
      className={cn(
        'clinical-pill whitespace-nowrap px-2 py-0.5 text-xs',
        style,
        className
      )}
    >
      {status.replace(/_/g, ' ')}
    </span>
  );
}
