'use client';

import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/workflow';

type NavItemProps = {
  href: string;
  icon: LucideIcon;
  label: string;
  pathname: string;
  activeOn?: string[];
  inactiveOn?: string[];
  collapsed?: boolean;
};

export function NavItem({ href, icon: Icon, label, pathname, activeOn = [], inactiveOn = [], collapsed = false }: NavItemProps) {
  const matches = (path: string) => path && (pathname === path || pathname.startsWith(path + '/'));
  const isSuppressed = inactiveOn.some(matches);
  const isActive = !isSuppressed && (matches(href) || activeOn.some(matches));

  return (
    <li className="sidebar-nav-li">
      <Link
        href={href}
        aria-current={isActive ? 'page' : undefined}
        className={cn('sidebar-nav-link', isActive && 'is-active')}
        data-tooltip={collapsed ? label : undefined}
        title={collapsed ? label : undefined}
      >
        <span className="sidebar-nav-icon" aria-hidden="true">
          <Icon size={20} />
        </span>
        <span className="sidebar-nav-label">
          {label}
        </span>
      </Link>
    </li>
  );
}
