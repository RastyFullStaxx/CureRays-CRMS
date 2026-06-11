import type { ReactNode } from 'react';

type StatGridProps = {
  children: ReactNode;
  className?: string;
  min?: string;
};

export function StatGrid({ children, className = '', min = '164px' }: StatGridProps) {
  return (
    <div
      className={`grid ${className}`}
      style={{
        gridTemplateColumns: `repeat(auto-fit, minmax(${min}, 1fr))`,
        gap: '12px',
        alignItems: 'stretch',
      }}
    >
      {children}
    </div>
  );
}
