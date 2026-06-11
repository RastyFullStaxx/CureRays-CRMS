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
          <div
            className="font-body font-bold uppercase"
            style={{ fontSize: 11, color: 'var(--color-text-muted)', lineHeight: 1.2, letterSpacing: 0 }}
          >
            {label}
          </div>
          <div
            className="truncate font-heading font-bold"
            style={{ marginTop: 5, fontSize: 21, lineHeight: 1.1, color: 'var(--color-text)' }}
          >
            {value}
          </div>
          {sub && (
            <div
              className="truncate"
              style={{ marginTop: 3, fontSize: 'var(--font-size-small)', color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}
            >
              {sub}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
