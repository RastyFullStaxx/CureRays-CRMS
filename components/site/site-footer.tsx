import Link from 'next/link';
import { SITE_NAV_ROUTES } from '@/lib/site-routes';
import { CLINIC, CONTACT, SOCIAL } from '@/lib/site-content';

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="site-footer-brand">
          <p className="site-footer-name">{CLINIC.name}</p>
          <p className="site-footer-tagline">{CLINIC.motto}</p>
          <address className="site-contact-address">
            {CONTACT.street}
            <br />
            {CONTACT.city}, {CONTACT.state} {CONTACT.postalCode}
          </address>
          <a className="site-contact-link clinical-focus" href={CONTACT.tollFreeHref}>
            {CONTACT.tollFreeLabel}
          </a>
          <a className="site-contact-link clinical-focus" href={CONTACT.emailHref}>
            {CONTACT.email}
          </a>
        </div>

        <nav className="site-footer-nav" aria-label="Footer">
          <p className="site-eyebrow">Explore</p>
          {SITE_NAV_ROUTES.map((route) => (
            <Link key={route.path} href={route.path} className="site-footer-link clinical-focus">
              {route.label}
            </Link>
          ))}
        </nav>

        <nav className="site-footer-nav" aria-label="Social">
          <p className="site-eyebrow">Follow</p>
          {SOCIAL.map((social) => (
            <a
              key={social.name}
              href={social.href}
              className="site-footer-link clinical-focus"
              target="_blank"
              rel="noreferrer"
            >
              {social.name}
            </a>
          ))}
        </nav>
      </div>

      <div className="site-footer-base">
        <p>
          © {CLINIC.name}. {CLINIC.tagline}
        </p>
        <Link href="/login" className="site-footer-link clinical-focus">
          Staff Login
        </Link>
      </div>
    </footer>
  );
}
