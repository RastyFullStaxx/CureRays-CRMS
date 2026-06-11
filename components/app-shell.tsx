'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/sidebar';

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  if (pathname === '/') {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-bg)]">
      <Sidebar />

      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        <main
          id="main-content"
          className="flex flex-col flex-1 overflow-hidden"
          style={{ padding: 'var(--space-page)' }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
