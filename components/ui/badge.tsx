import type { ReactNode } from 'react';
import { cn } from '@/lib/workflow';

type BadgeProps = {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'primary';
  children: ReactNode;
  className?: string;
};

const variantClasses = {
  default: 'bg-[var(--color-badge-default-bg)] text-[var(--color-badge-default-fg)] ring-[var(--color-badge-default-border)]',
  success: 'bg-[var(--color-badge-success-bg)] text-[var(--color-badge-success-fg)] ring-[var(--color-badge-success-border)]',
  warning: 'bg-[var(--color-badge-warning-bg)] text-[var(--color-badge-warning-fg)] ring-[var(--color-badge-warning-border)]',
  error: 'bg-[var(--color-badge-error-bg)] text-[var(--color-badge-error-fg)] ring-[var(--color-badge-error-border)]',
  info: 'bg-[var(--color-badge-info-bg)] text-[var(--color-badge-info-fg)] ring-[var(--color-badge-info-border)]',
  primary: 'bg-[var(--color-badge-primary-bg)] text-[var(--color-badge-primary-fg)] ring-[var(--color-badge-primary-border)]',
};

export function Badge({ variant = 'default', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'clinical-pill whitespace-nowrap px-2.5 py-1 text-[11px] ring-1',
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
