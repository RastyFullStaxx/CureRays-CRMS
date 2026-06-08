import type { ReactNode } from 'react';
import { cn } from '@/lib/workflow';

type BadgeProps = {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'primary';
  children: ReactNode;
  className?: string;
};

const variantClasses = {
  default: 'bg-[var(--color-hover)] text-[var(--color-text-muted)]',
  success: 'bg-emerald-50 text-emerald-700',
  warning: 'bg-amber-50 text-amber-700',
  error: 'bg-red-50 text-red-700',
  info: 'bg-blue-50 text-blue-700',
  primary: 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]',
};

export function Badge({ variant = 'default', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold whitespace-nowrap',
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
