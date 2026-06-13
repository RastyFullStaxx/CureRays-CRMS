'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
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
  const linkRef = useRef<HTMLAnchorElement>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ left: number; top: number } | null>(null);
  const matches = (path: string) => path && (pathname === path || pathname.startsWith(path + '/'));
  const isSuppressed = inactiveOn.some(matches);
  const isActive = !isSuppressed && (matches(href) || activeOn.some(matches));

  useEffect(() => {
    if (!tooltipPosition) return undefined;

    const hideOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setTooltipPosition(null);
      }
    };

    window.addEventListener('keydown', hideOnEscape);
    return () => window.removeEventListener('keydown', hideOnEscape);
  }, [tooltipPosition]);

  const showTooltip = () => {
    if (!collapsed || !linkRef.current) return;

    const rect = linkRef.current.getBoundingClientRect();
    setTooltipPosition({
      left: rect.right + 10,
      top: rect.top + rect.height / 2,
    });
  };

  const hideTooltip = () => {
    setTooltipPosition(null);
  };

  return (
    <li className="sidebar-nav-li">
      <Link
        ref={linkRef}
        href={href}
        aria-current={isActive ? 'page' : undefined}
        className={cn('sidebar-nav-link', isActive && 'is-active')}
        onBlur={hideTooltip}
        onClick={hideTooltip}
        onFocus={showTooltip}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        title={collapsed ? label : undefined}
      >
        <span className="sidebar-nav-icon" aria-hidden="true">
          <Icon size={20} />
        </span>
        <span className="sidebar-nav-label">
          {label}
        </span>
      </Link>
      {collapsed && tooltipPosition
        ? createPortal(
            <span
              className="sidebar-floating-tooltip"
              style={{
                left: tooltipPosition.left,
                top: tooltipPosition.top,
              }}
            >
              {label}
            </span>,
            document.body
          )
        : null}
    </li>
  );
}
