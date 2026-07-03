'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { MacNavigation } from '@/components/mac-navigation';

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  if (pathname === '/' || pathname === '/login') {
    return <>{children}</>;
  }

  return (
    <div className="mac-desktop">
      <MacNavigation />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <main
          id="main-content"
          className="mac-main"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
