import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/workflow';

type ScrollAreaProps = HTMLAttributes<HTMLDivElement> & {
  axis?: 'x' | 'y' | 'both';
  children: ReactNode;
};

const axisClasses = {
  x: 'overflow-x-auto overflow-y-hidden',
  y: 'overflow-y-auto overflow-x-hidden',
  both: 'overflow-auto',
};

export function ScrollArea({ axis = 'y', className, children, ...props }: ScrollAreaProps) {
  return (
    <div className={cn('scrollbar-soft min-h-0', axisClasses[axis], className)} {...props}>
      {children}
    </div>
  );
}
