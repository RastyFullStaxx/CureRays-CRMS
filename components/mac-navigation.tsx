'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSyncExternalStore } from 'react';
import {
  Bell,
  CalendarDays,
  ClipboardCheck,
  Command,
  LayoutDashboard,
  LineChart,
  Moon,
  Search,
  Settings,
  Sun,
  TableProperties,
} from 'lucide-react';
import { cn } from '@/lib/workflow';

const commandItems = [
  { key: 'dashboard', href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { key: 'patients', href: '/patients', icon: TableProperties, label: 'Patients' },
  { key: 'today', href: '/today', icon: ClipboardCheck, label: 'Today' },
  { key: 'schedule', href: '/schedule', icon: CalendarDays, label: 'Schedule' },
  { key: 'analytics', href: '/analytics', icon: LineChart, label: 'Analytics' },
  { key: 'settings', href: '/settings', icon: Settings, label: 'Settings' },
];

function getStoredDarkMode() {
  if (typeof window === 'undefined') {
    return false;
  }

  const stored = localStorage.getItem('curerays_theme_mode');
  return stored !== null
    ? stored === 'dark'
    : document.documentElement.classList.contains('dark');
}

function subscribeToTheme(callback: () => void) {
  window.addEventListener('storage', callback);
  window.addEventListener('curerays-theme-change', callback);

  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener('curerays-theme-change', callback);
  };
}

function matchesRoute(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function MacNavigation() {
  const pathname = usePathname() ?? '';
  const darkMode = useSyncExternalStore(subscribeToTheme, getStoredDarkMode, () => false);

  const toggleDarkMode = () => {
    const next = !darkMode;
    localStorage.setItem('curerays_theme_mode', next ? 'dark' : 'light');
    localStorage.removeItem('curerays_darkmode');
    document.documentElement.classList.toggle('dark', next);
    window.dispatchEvent(new Event('curerays-theme-change'));
  };

  return (
    <header className="mac-command-bar">
      <div className="mac-command-inner">
        <Link href="/dashboard" className="mac-brand" aria-label="CureRays Dashboard">
          <Image
            src="/System_Logo.svg"
            alt=""
            width={26}
            height={26}
            className="mac-brand-mark"
          />
          <span className="mac-brand-name">CureRays</span>
        </Link>

        <nav className="mac-command-nav" aria-label="Primary Navigation">
          {commandItems.map((item) => {
            const Icon = item.icon;
            const isActive = matchesRoute(pathname, item.href);

            return (
              <Link
                key={item.key}
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={cn('mac-command-nav-item', isActive && 'is-active')}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mac-command-tools">
          <button type="button" className="mac-spotlight" aria-label="Search Patient Records">
            <Search className="h-4 w-4" aria-hidden="true" />
            <span className="mac-spotlight-label">Search patient, MRN, course, or action</span>
            <span className="mac-spotlight-shortcut">
              <Command className="h-3 w-3" aria-hidden="true" />
              K
            </span>
          </button>

          <div className="mac-menu-actions">
            <button type="button" className="mac-icon-button" aria-label="Course Notifications">
              <Bell className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={toggleDarkMode}
              className="mac-icon-button"
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? <Sun className="h-4 w-4" aria-hidden="true" /> : <Moon className="h-4 w-4" aria-hidden="true" />}
            </button>
            <div className="mac-account" aria-label="Signed in as Dr. Sarah Johnson">
              <span className="mac-account-avatar">SJ</span>
              <span className="mac-account-copy">
                <span className="mac-account-name">Dr. Sarah Johnson</span>
                <span className="mac-account-role">Physician</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
