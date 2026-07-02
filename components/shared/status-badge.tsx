import { cn } from '@/lib/workflow';
import { statusTone } from '@/lib/status-utils';

type StatusBadgeProps = {
  status: string;
  className?: string;
};

const toneStyles = {
  default: 'clinical-pill-default',
  success: 'clinical-pill-success',
  warning: 'clinical-pill-warning',
  error: 'clinical-pill-error',
  info: 'clinical-pill-info',
  primary: 'clinical-pill-primary',
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const style = toneStyles[statusTone(status)];
  return (
    <span
      className={cn(
        'clinical-pill whitespace-nowrap px-2 py-0.5 type-supporting',
        style,
        className
      )}
    >
      {status.replace(/_/g, ' ')}
    </span>
  );
}
