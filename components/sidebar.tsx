'use client';

import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  LayoutDashboard,
  TableProperties,
  ClipboardCheck,
  CalendarDays,
  LineChart,
  Settings,
  Sun,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { NavItem } from './layout/nav-item';

const NAV_SECTIONS = [
  {
    key: 'daily',
    label: 'Daily Work',
    items: [
      { key: 'patients', href: '/patients', icon: TableProperties, label: 'Patients' },
      { key: 'today', href: '/today', icon: ClipboardCheck, label: 'Today' },
      { key: 'schedule', href: '/schedule', icon: CalendarDays, label: 'Schedule' },
    ],
  },
  {
    key: 'insight',
    label: 'Oversight',
    items: [
      { key: 'dashboard', href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { key: 'analytics', href: '/analytics', icon: LineChart, label: 'Analytics' },
    ],
  },
  {
    key: 'admin',
    label: 'Administration',
    items: [
      { key: 'settings', href: '/settings', icon: Settings, label: 'Settings' },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }

    const stored = localStorage.getItem('curerays_sidebar_collapsed');
    return stored === 'true';
  });
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }

    const stored = localStorage.getItem('curerays_darkmode');
    return stored !== null
      ? stored === 'true'
      : document.documentElement.classList.contains('dark');
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    localStorage.setItem('curerays_darkmode', next.toString());
  };

  const toggleCollapse = () => {
    setCollapsed((current) => {
      const next = !current;
      localStorage.setItem('curerays_sidebar_collapsed', next.toString());
      return next;
    });
  };

  return (
    <aside
      className="sidebar-shell"
      data-collapsed={collapsed ? 'true' : 'false'}
    >
      <div className="sidebar-header">
        <div className="sidebar-brand" aria-hidden={collapsed}>
          <Image
            src="/System_Logo.svg"
            alt="CureRays"
            width={28}
            height={28}
            className="sidebar-brand-mark"
          />
          <span className="sidebar-brand-name">CureRays</span>
        </div>

        <div className="sidebar-header-controls">
          {!collapsed && (
            <button
              type="button"
              onClick={toggleDarkMode}
              className="sidebar-toggle"
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          )}
          <button
            type="button"
            onClick={toggleCollapse}
            className="sidebar-toggle"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
          </button>
        </div>
      </div>

      <nav className="sidebar-nav scrollbar-soft" aria-label="Primary navigation">
        {NAV_SECTIONS.map((section) => (
          <div key={section.key} className="sidebar-section">
            <div className="sidebar-section-label" aria-hidden={collapsed}>
              {section.label}
            </div>
            <ul className="sidebar-nav-list">
              {section.items.map((item) => (
                <NavItem
                  key={item.key}
                  href={item.href}
                  icon={item.icon}
                  label={item.label}
                  pathname={pathname ?? ''}
                  collapsed={collapsed}
                />
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="sidebar-account">
        <div className="sidebar-account-inner">
          <div className="sidebar-account-avatar">
            SJ
          </div>
          <div className="sidebar-account-copy" aria-hidden={collapsed}>
            <div className="sidebar-account-name">
              Dr. Sarah Johnson
            </div>
            <div className="sidebar-account-role">
              Physician
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
