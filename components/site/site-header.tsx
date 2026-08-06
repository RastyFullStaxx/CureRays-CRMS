import Image from 'next/image';
import Link from 'next/link';
import { SiteNav } from '@/components/site/site-nav';
import { CLINIC, CONTACT } from '@/lib/site-content';

export function SiteHeader() {
  return (
    <header className="site-header">
      <a className="site-skip-link clinical-focus" href="#site-main">
        Skip to content
      </a>

      <div className="site-header-inner">
        <Link className="site-wordmark clinical-focus" href="/">
          <Image src="/System_Logo.svg" alt="" width={38} height={38} priority />
          <span>
            <strong>{CLINIC.shortName}</strong>
            <span className="site-wordmark-sub">Radiation Medicine</span>
          </span>
        </Link>

        <SiteNav />

        <div className="site-header-actions">
          <Link className="site-header-staff clinical-focus" href="/login">
            Staff Login
          </Link>
          {/* Fitts: the phone is the largest, most reachable target on the page. */}
          <a className="site-button site-button-primary clinical-focus" href={CONTACT.tollFreeHref}>
            {CONTACT.tollFreeLabel}
          </a>
        </div>
      </div>
    </header>
  );
}
