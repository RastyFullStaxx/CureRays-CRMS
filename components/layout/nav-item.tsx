'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

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

  const itemStyle = {
    borderRadius: 'var(--radius-md)',
    height: '34px',
  };

  if (collapsed) {
    return (
      <li style={{ display: 'flex', justifyContent: 'center' }}>
        <Link
          href={href}
          className="flex items-center justify-center"
          style={{
            ...itemStyle,
            width: 40,
            background: isActive ? 'var(--color-primary)' : 'transparent',
            color: isActive ? '#ffffff' : 'var(--color-text-muted)',
          }}
          data-tooltip={label}
        >
          <Icon size={20} />
        </Link>
      </li>
    );
  }

  return (
    <li>
      <Link
        href={href}
        className="flex items-center w-full"
        style={{
          ...itemStyle,
          gap: '10px',
          paddingLeft: '10px',
          paddingRight: '10px',
          fontSize: 'var(--font-size-small)',
          fontFamily: 'var(--font-body)',
          fontWeight: isActive ? 'var(--font-weight-semibold)' : 'var(--font-weight-normal)',
          background: isActive ? 'var(--color-primary)' : 'transparent',
          color: isActive ? '#ffffff' : 'var(--color-text)',
          textDecoration: 'none',
        }}
        onMouseEnter={(e) => {
          if (!isActive) e.currentTarget.style.background = 'var(--color-hover)';
        }}
        onMouseLeave={(e) => {
          if (!isActive) e.currentTarget.style.background = 'transparent';
        }}
      >
        <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center', color: isActive ? '#ffffff' : 'var(--color-text-muted)' }}>
          <Icon size={20} />
        </span>
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {label}
        </span>
      </Link>
    </li>
  );
}