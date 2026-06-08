import type { ReactNode, ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/workflow';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'default' | 'sm';
  children: ReactNode;
};

const variantClasses = {
  primary: 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)]',
  secondary: 'border border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-primary)] hover:bg-[var(--color-hover)]',
  ghost: 'text-[var(--color-text-muted)] hover:bg-[var(--color-hover)] hover:text-[var(--color-text)]',
  danger: 'bg-[var(--color-error)] text-white hover:bg-red-600',
};

const sizeClasses = {
  default: 'h-[var(--height-btn)] px-4 text-sm',
  sm: 'h-[var(--height-btn-sm)] px-3 text-xs',
};

export function Button({ variant = 'primary', size = 'default', className, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 font-semibold rounded-[var(--radius-md)] transition-colors duration-0',
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
