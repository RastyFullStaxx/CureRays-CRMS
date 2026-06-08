import type { ReactNode } from 'react';

type FilterStripProps = {
  children: ReactNode;
  className?: string;
};

export function FilterStrip({ children, className = '' }: FilterStripProps) {
  return (
    <div
      className={`flex flex-wrap items-center ${className}`}
      style={{ gap: 'var(--space-1)' }}
    >
      {children}
    </div>
  );
}

type FilterFieldProps = {
  children: ReactNode;
  grow?: boolean;
  width?: number;
  className?: string;
};

export function FilterField({ children, grow = false, width = 168, className = '' }: FilterFieldProps) {
  return (
    <div
      className={className}
      style={{
        flex: grow ? '1 1 260px' : `0 1 ${width}px`,
        minWidth: grow ? 220 : Math.min(width, 180),
      }}
    >
      {children}
    </div>
  );
}
