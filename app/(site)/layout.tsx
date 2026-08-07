import type { ReactNode } from 'react';
import { Roboto } from 'next/font/google';
import { SiteHeader } from '@/components/site/site-header';
import { SiteFooter } from '@/components/site/site-footer';
import { SiteStructuredData } from '@/components/site/site-structured-data';

/**
 * Public-site typeface. SIL OFL, and `next/font/google` self-hosts it at build
 * time — no runtime CDN request, so no visitor IP reaches a third party.
 *
 * One family carries both roles, separated by weight rather than by contrast of
 * form: 700 for display and headings, 400/500 for reading. The two tokens stay
 * distinct in globals.css so a display face can be reintroduced later without
 * touching every rule that consumes them.
 *
 * Scoped to this element on purpose: CSS custom properties only descend, so the
 * authenticated app under app/(app)/ cannot inherit this and stays on Inter.
 */
const roboto = Roboto({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto'
});

export default function SiteLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <div className={`site-page ${roboto.variable}`}>
      <SiteStructuredData />
      <SiteHeader />
      <main id="site-main" className="site-main">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
