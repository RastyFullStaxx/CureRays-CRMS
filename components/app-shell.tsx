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
        <div
          className="shrink-0 border-b px-4 py-2 text-center text-xs font-bold"
          style={{
            background: 'color-mix(in srgb, var(--color-warning) 12%, var(--color-card))',
            borderColor: 'var(--color-border-soft)',
            color: 'var(--color-text)',
          }}
        >
          Prototype environment: mock or de-identified data only. Do not enter real PHI.
        </div>
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
