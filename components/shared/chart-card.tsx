import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';

type ChartCardProps = {
  icon?: LucideIcon;
  title: string;
  description?: string;
  height?: 'sm' | 'md' | 'lg' | 'xl' | 'auto';
  footer?: ReactNode;
  className?: string;
  children: ReactNode;
};

export function ChartCard({
  icon: Icon,
  title,
  description,
  height = 'auto',
  footer,
  className = '',
  children,
}: ChartCardProps) {
  return (
    <Card as="article" compact className={`chart-card ${className}`}>
      <div className="chart-card-header">
        {Icon ? (
          <span className="chart-card-icon">
            <Icon size={16} />
          </span>
        ) : null}
        <div className="min-w-0">
          <h2>{title}</h2>
          {description ? <p>{description}</p> : null}
        </div>
      </div>
      <div className="chart-card-frame" data-height={height}>
        {children}
      </div>
      {footer ? <div className="chart-card-footer">{footer}</div> : null}
    </Card>
  );
}
