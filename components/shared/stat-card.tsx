import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { isValidElement } from 'react';
import { Card } from '@/components/ui/card';

type StatCardProps = {
  icon?: LucideIcon | ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  tone?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'primary';
  color?: string;
  className?: string;
};

export function StatCard({ icon, label, value, sub, className = '' }: StatCardProps) {
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
            className="flex h-10 w-10 shrink-0 items-center justify-center"
            style={{
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-stat-icon-bg)',
              color: 'var(--color-primary)',
            }}
          >
            {iconNode}
          </div>
        )}
        <div className="min-w-0">
          <div className="type-label uppercase text-[var(--color-text-muted)]">
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
