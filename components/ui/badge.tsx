import type { ReactNode } from 'react';
import { cn } from '@/lib/workflow';
import type { BadgeVariant } from '@/lib/status-utils';

type BadgeProps = {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
};

const variantClasses = {
  default: 'clinical-pill-default',
  success: 'clinical-pill-success',
  warning: 'clinical-pill-warning',
  error: 'clinical-pill-error',
  info: 'clinical-pill-info',
  primary: 'clinical-pill-primary',
};

export function Badge({ variant = 'default', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'clinical-pill type-label whitespace-nowrap px-2 py-0.5',
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
