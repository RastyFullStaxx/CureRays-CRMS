'use client';

import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  LayoutDashboard,
  TableProperties,
  NotebookTabs,
  ClipboardList,
  ListChecks,
  CalendarDays,
  Radiation,
  FileText,
  Target,
  Image as ImageIcon,
  FolderOpen,
  WalletCards,
  ShieldCheck,
  LineChart,
  UserCog,
  Settings,
  Sun,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { NavItem } from './layout/nav-item';

const NAV_SECTIONS = [
  {
    key: 'overview',
    label: 'Overview',
    items: [
      { key: 'dashboard', href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    ],
  },
  {
    key: 'patients',
    label: 'Patient Management',
    items: [
      { key: 'patients', href: '/patients', icon: TableProperties, label: 'Patients' },
      { key: 'courses', href: '/courses', icon: NotebookTabs, label: 'Courses' },
    ],
  },
  {
    key: 'clinical',
    label: 'Clinical Operations',
    items: [
      { key: 'workflow', href: '/workflow', icon: ClipboardList, label: 'Workflow' },
      { key: 'tasks', href: '/tasks', icon: ListChecks, label: 'Tasks' },
      { key: 'schedule', href: '/schedule', icon: CalendarDays, label: 'Schedule' },
      { key: 'treatment-delivery', href: '/treatment-delivery', icon: Radiation, label: 'Treatment Delivery' },
    ],
  },
  {
    key: 'tools',
    label: 'Clinical Tools',
    items: [
      { key: 'clinical-forms', href: '/clinical-forms', icon: FileText, label: 'Clinical Forms' },
      { key: 'treatment-planning', href: '/treatment-planning', icon: Target, label: 'Treatment Planning' },
      { key: 'imaging', href: '/imaging', icon: ImageIcon, label: 'Imaging' },
    ],
  },
  {
    key: 'docs',
    label: 'Documentation',
    items: [
      { key: 'documents', href: '/documents', icon: FolderOpen, label: 'Documents' },
      { key: 'billing', href: '/billing', icon: WalletCards, label: 'Billing' },
      { key: 'audit', href: '/audit', icon: ShieldCheck, label: 'Audit & QA' },
    ],
  },
  {
    key: 'intel',
    label: 'Intelligence',
    items: [
      { key: 'analytics', href: '/analytics', icon: LineChart, label: 'Analytics & Reports' },
    ],
  },
  {
    key: 'admin',
    label: 'Administration',
    items: [
      { key: 'users-roles', href: '/users-roles', icon: UserCog, label: 'Users & Roles' },
      { key: 'templates', href: '/templates', icon: FileText, label: 'Templates' },
      { key: 'settings', href: '/settings', icon: Settings, label: 'Settings' },
      { key: 'security-logs', href: '/security-logs', icon: ShieldCheck, label: 'Security Logs' },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('curerays_sidebar_collapsed');
    if (stored !== null) {
      setCollapsed(stored === 'true');
    }
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem('curerays_darkmode');
    const isDark = stored !== null
      ? stored === 'true'
      : document.documentElement.classList.contains('dark');
    setDarkMode(isDark);
    document.documentElement.classList.toggle('dark', isDark);
  }, []);

  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    localStorage.setItem('curerays_darkmode', next.toString());
    document.documentElement.classList.toggle('dark', next);
  };

  const toggleCollapse = () => {
    setCollapsed(!collapsed);
    localStorage.setItem('curerays_sidebar_collapsed', (!collapsed).toString());
  };

  return (
    <aside
      className="flex flex-col h-screen"
      style={{
        width: collapsed ? 'var(--width-sidebar-collapsed)' : 'var(--width-sidebar)',
        background: 'var(--color-card)',
        borderRight: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-card)',
        transition: 'width 200ms ease',
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      {/* Header Area */}
      <div
        className="flex items-center"
        style={{
          height: 'var(--height-header)',
          padding: collapsed ? '0 3px' : '0 16px',
          borderBottom: '1px solid var(--color-border)',
          justifyContent: collapsed ? 'center' : 'space-between',
        }}
      >
        {/* Logo + Title */}
        {!collapsed && (
          <div className="flex items-center" style={{ overflow: 'hidden', whiteSpace: 'nowrap', minWidth: 0 }}>
            <Image
              src="/System_Logo.svg"
              alt="CureRays"
              width={28}
              height={28}
              style={{ flexShrink: 0 }}
            />
            <span
              style={{
                marginLeft: '10px',
                fontWeight: 'var(--font-weight-bold)',
                fontFamily: 'var(--font-heading)',
                fontSize: 'var(--font-size-body)',
                color: 'var(--color-text)',
              }}
            >
              CureRays
            </span>
          </div>
        )}

        {/* Controls: Dark mode toggle + Collapse button */}
        <div className="flex items-center" style={{ gap: collapsed ? 2 : 4, flexShrink: 0 }}>
          <button
            onClick={toggleDarkMode}
            className="flex items-center justify-center"
            style={{
              width: 28,
              height: 28,
              borderRadius: 'var(--radius-md)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-text-muted)',
            }}
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            data-tooltip={collapsed ? (darkMode ? 'Light mode' : 'Dark mode') : undefined}
          >
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button
            onClick={toggleCollapse}
            className="flex items-center justify-center"
            style={{
              width: 28,
              height: 28,
              borderRadius: 'var(--radius-md)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-text-muted)',
            }}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
          </button>
        </div>
      </div>

      {/* Nav Sections */}
      <nav
        className="flex-1"
        style={{
          padding: collapsed ? '8px 0' : '8px 12px',
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        {NAV_SECTIONS.map((section) => (
          <div key={section.key} style={{ marginBottom: '8px' }}>
            {!collapsed && (
              <div
                style={{
                  padding: '0 10px 6px',
                  fontSize: 'var(--font-size-label)',
                  fontFamily: 'var(--font-body)',
                  fontWeight: 'var(--font-weight-bold)',
                  color: 'var(--color-text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                {section.label}
              </div>
            )}
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: collapsed ? 'flex' : undefined, flexDirection: collapsed ? 'column' : undefined, alignItems: collapsed ? 'center' : undefined }}>
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

      {/* Account Row */}
      <div
        className="flex items-center"
        style={{
          height: 'var(--height-header)',
          padding: collapsed ? '0 12px' : '0 16px',
          borderTop: '1px solid var(--color-border)',
          overflow: 'hidden',
        }}
      >
        <div
          className="flex items-center"
          style={{
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            width: '100%',
            minWidth: 0,
          }}
        >
          <div
            className="flex items-center justify-center"
            style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: 'var(--color-primary)',
              color: 'var(--color-primary-foreground)',
              fontSize: 'var(--font-size-small)',
              fontWeight: 'var(--font-weight-bold)',
              flexShrink: 0,
            }}
          >
            SJ
          </div>
          {!collapsed && (
            <div style={{ marginLeft: '10px', overflow: 'hidden' }}>
              <div
                style={{
                  fontSize: 'var(--font-size-small)',
                  fontFamily: 'var(--font-body)',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--color-text)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                Dr. Sarah Johnson
              </div>
              <div
                style={{
                  fontSize: 'var(--font-size-caption)',
                  fontFamily: 'var(--font-body)',
                  color: 'var(--color-text-muted)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                Physician
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
