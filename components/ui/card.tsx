import type { ReactNode, ElementType, ComponentPropsWithoutRef } from 'react';

type CardProps<T extends ElementType = 'div'> = {
  children: ReactNode;
  className?: string;
  compact?: boolean;
  as?: T;
  style?: Record<string, string>;
} & Omit<ComponentPropsWithoutRef<T>, 'children' | 'className' | 'style'>;

export function Card<T extends ElementType = 'div'>({ children, className = '', compact = false, as, style = {}, ...rest }: CardProps<T>) {
  const Tag = (as ?? 'div') as ElementType;
  return (
    <Tag
      className={`bg-[var(--color-card)] ${className}`}
      style={{
        padding: compact ? 'var(--space-2)' : 'var(--space-card)',
        border: 'var(--border-container)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-card)',
        ...style,
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
