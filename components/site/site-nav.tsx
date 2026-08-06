'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger
} from '@/components/ui/sheet';
import { SITE_NAV_ROUTES } from '@/lib/site-routes';
import { CONTACT } from '@/lib/site-content';

/**
 * The only client component on the public site. It owns both presentations of
 * the same navigation so active state lives in one place: inline links from
 * 768px up, a drawer below it.
 */
export function SiteNav() {
  const pathname = usePathname();
  const isCurrent = (path: string) => pathname === path;

  return (
    <>
      <nav className="site-nav-desktop" aria-label="Primary">
        {SITE_NAV_ROUTES.map((route) => (
          <Link
            key={route.path}
            href={route.path}
            className="site-nav-link clinical-focus"
            aria-current={isCurrent(route.path) ? 'page' : undefined}
          >
            {route.label}
          </Link>
        ))}
      </nav>

      {/* Uncontrolled: every drawer link is wrapped in SheetClose, so Radix owns
          the open state and no effect has to chase the pathname. */}
      <Sheet>
        <SheetTrigger
          className="site-nav-trigger clinical-focus"
          aria-label="Open navigation menu"
        >
          <Menu aria-hidden="true" className="h-5 w-5" />
        </SheetTrigger>

        <SheetContent side="right" className="site-nav-drawer">
          <SheetTitle className="site-eyebrow">Menu</SheetTitle>

          <nav className="site-nav-drawer-links" aria-label="Primary">
            {SITE_NAV_ROUTES.map((route) => (
              <SheetClose asChild key={route.path}>
                <Link
                  href={route.path}
                  className="site-nav-drawer-link clinical-focus"
                  aria-current={isCurrent(route.path) ? 'page' : undefined}
                >
                  {route.label}
                </Link>
              </SheetClose>
            ))}
          </nav>

          <a className="site-button site-button-primary clinical-focus" href={CONTACT.tollFreeHref}>
            Call {CONTACT.tollFreeLabel}
          </a>

          <SheetClose asChild>
            <Link href="/login" className="site-nav-drawer-staff clinical-focus">
              Staff Login
            </Link>
          </SheetClose>
        </SheetContent>
      </Sheet>
    </>
  );
}
