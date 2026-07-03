import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { isValidElement } from 'react';
import { Card } from '@/components/ui/card';
import type { StatusTone } from '@/lib/status-utils';

type StatCardProps = {
  icon?: LucideIcon | ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  tone?: StatusTone;
  className?: string;
};

export function StatCard({
  icon,
  label,
  value,
  sub,
  tone = 'neutral',
  className = '',
}: StatCardProps) {
  let iconNode: ReactNode = null;
  if (icon) {
    if (isValidElement(icon)) {
      iconNode = icon;
    } else {
      const Icon = icon as LucideIcon;
      iconNode = <Icon size={18} />;
    }
  }

  return (
    <Card compact className={`overflow-hidden ${className}`}>
      <div className="flex h-full items-center gap-3">
        {iconNode && (
          <div
            className="stat-card-icon flex h-10 w-10 shrink-0 items-center justify-center"
            data-tone={tone}
          >
            {iconNode}
          </div>
        )}
        <div className="min-w-0">
          <div className="type-label text-[var(--color-text-muted)]">
            {label}
          </div>
          <div className="type-title mt-1 truncate text-[var(--color-text)]">
            {value}
          </div>
          {sub && (
            <div className="type-supporting mt-1 truncate text-[var(--color-text-muted)]">
              {sub}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
