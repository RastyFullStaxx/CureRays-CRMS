import type { ReactNode, ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/workflow';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'default' | 'sm';
  children: ReactNode;
};

const variantClasses = {
  primary: 'border border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-primary-foreground)] shadow-[0_10px_22px_-18px_var(--color-primary)] hover:bg-[var(--color-primary-dark)]',
  secondary: 'border border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-primary)] hover:border-[var(--color-primary)]/30 hover:bg-[var(--color-primary-soft)]',
  ghost: 'border border-transparent text-[var(--color-text-muted)] hover:bg-[var(--color-hover)] hover:text-[var(--color-text)]',
  danger: 'border border-[var(--color-error)] bg-[var(--color-error)] text-white hover:brightness-95',
};

const sizeClasses = {
  default: 'h-[var(--height-btn)] px-4 text-sm',
  sm: 'h-[var(--height-btn-sm)] px-3 text-xs',
};

export function Button({ variant = 'primary', size = 'default', className, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'clinical-focus inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] font-semibold transition',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
