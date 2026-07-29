import type { ReactNode } from 'react';
import { PageHeader } from '@/components/shared/page-header';

type StickyPageHeaderProps = {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  tabs?: ReactNode;
  className?: string;
};

export function StickyPageHeader({ title, subtitle, actions, tabs, className = '' }: StickyPageHeaderProps) {
  const headerActions = tabs || actions ? (
    <>
      {tabs}
      {actions}
    </>
  ) : undefined;

  return (
    <div className={`page-sticky-header ${className}`}>
      <PageHeader title={title} subtitle={subtitle} actions={headerActions} />
    </div>
  );
}
