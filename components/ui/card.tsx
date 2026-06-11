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
      className={`clinical-surface ${className}`}
      style={{
        padding: compact ? '14px' : 'var(--space-card)',
        ...style,
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
