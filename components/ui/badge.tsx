import type { ReactNode } from 'react';
import { cn } from '@/lib/workflow';
import type { BadgeVariant } from '@/lib/status-utils';

type BadgeProps = {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
};

const variantClasses = {
  positive: 'clinical-pill-positive',
  intermediate: 'clinical-pill-intermediate',
  negative: 'clinical-pill-negative',
  neutral: 'clinical-pill-neutral',
};

export function Badge({ variant = 'neutral', children, className }: BadgeProps) {
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
