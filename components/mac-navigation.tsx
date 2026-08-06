'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useRef, useState, useSyncExternalStore } from 'react';
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
import { roleLabels } from '@/lib/rbac';
import type { ResponsibleParty } from '@/lib/types';
import { cn } from '@/lib/utils';

export type ShellIdentity = {
  displayName: string;
  role: ResponsibleParty;
};

const commandItems = [
  { key: 'dashboard', href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { key: 'patients', href: '/patients', icon: TableProperties, label: 'Patients' },
  { key: 'tasks', href: '/tasks', icon: ClipboardCheck, label: 'Tasks' },
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

function initials(displayName: string) {
  return displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

export function MacNavigation({ identity }: { identity: ShellIdentity }) {
  const pathname = usePathname() ?? '';
  const router = useRouter();
  const darkMode = useSyncExternalStore(subscribeToTheme, getStoredDarkMode, () => false);
  const themeButtonRef = useRef<HTMLButtonElement>(null);
  const [logoutPending, setLogoutPending] = useState(false);

  const logout = async () => {
    if (logoutPending) return;
    setLogoutPending(true);

    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' });
      if (!response.ok) return;
      router.replace('/login');
      router.refresh();
    } finally {
      setLogoutPending(false);
    }
  };

  const toggleDarkMode = async () => {
    const next = !darkMode;
    const applyTheme = () => {
      localStorage.setItem('curerays_theme_mode', next ? 'dark' : 'light');
      localStorage.removeItem('curerays_darkmode');
      document.documentElement.classList.toggle('dark', next);
      window.dispatchEvent(new Event('curerays-theme-change'));
    };
    const transitionDocument = document as Document & {
      startViewTransition?: (update: () => void) => { ready: Promise<void> };
    };
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const desktopViewport = window.matchMedia('(min-width: 701px)').matches;

    if (!transitionDocument.startViewTransition || reduceMotion || !desktopViewport) {
      applyTheme();
      return;
    }

    const transition = transitionDocument.startViewTransition(applyTheme);
    await transition.ready;

    const buttonBounds = themeButtonRef.current?.getBoundingClientRect();
    const originX = buttonBounds ? buttonBounds.left + buttonBounds.width / 2 : window.innerWidth;
    const originY = buttonBounds ? buttonBounds.top + buttonBounds.height / 2 : 0;
    const radius = Math.hypot(
      Math.max(originX, window.innerWidth - originX),
      Math.max(originY, window.innerHeight - originY),
    );

    document.documentElement.animate(
      {
        clipPath: [
          `circle(0 at ${originX}px ${originY}px)`,
          `circle(${radius}px at ${originX}px ${originY}px)`,
        ],
      },
      {
        duration: 2000,
        easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
        pseudoElement: '::view-transition-new(root)',
      },
    );
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
                aria-label={item.label}
                aria-current={isActive ? 'page' : undefined}
                title={item.label}
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
              ref={themeButtonRef}
              type="button"
              onClick={toggleDarkMode}
              className="mac-icon-button"
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? <Sun className="theme-toggle-icon h-4 w-4" aria-hidden="true" /> : <Moon className="theme-toggle-icon h-4 w-4" aria-hidden="true" />}
            </button>
            <button
              type="button"
              className="mac-account"
              onClick={logout}
              disabled={logoutPending}
              aria-label={`Sign out ${identity.displayName}`}
              title="Sign Out"
            >
              <span className="mac-account-avatar">{initials(identity.displayName)}</span>
              <span className="mac-account-copy">
                <span className="mac-account-name">{identity.displayName}</span>
                <span className="mac-account-role">{roleLabels[identity.role]}</span>
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
