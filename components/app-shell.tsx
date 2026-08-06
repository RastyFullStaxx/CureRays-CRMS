import type { ReactNode } from 'react';
import {
  MacNavigation,
  type ShellIdentity
} from '@/components/mac-navigation';

export function AppShell({
  children,
  identity
}: {
  children: ReactNode;
  identity: ShellIdentity | null;
}) {
  return (
    <div className="mac-desktop">
      {identity ? <MacNavigation identity={identity} /> : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <main
          id="main-content"
          className="mac-main scrollbar-soft"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
