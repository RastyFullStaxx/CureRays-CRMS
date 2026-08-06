import type { ReactNode } from 'react';
import { Instrument_Serif, Schibsted_Grotesk } from 'next/font/google';
import { SiteHeader } from '@/components/site/site-header';
import { SiteFooter } from '@/components/site/site-footer';

/**
 * Public-site typefaces. Both are SIL OFL, and `next/font/google` self-hosts them
 * at build time — no runtime CDN request, so no visitor IP reaches a third party.
 *
 * Scoped to this element on purpose: CSS custom properties only descend, so the
 * authenticated app under app/(app)/ cannot inherit these and stays on Inter.
 */
const displayFace = Instrument_Serif({
  subsets: ['latin'],
  display: 'swap',
  weight: '400',
  variable: '--font-instrument-serif'
});

const textFace = Schibsted_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-schibsted-grotesk'
});

export default function SiteLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <div className={`site-page ${displayFace.variable} ${textFace.variable}`}>
      <SiteHeader />
      <main id="site-main" className="site-main">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
