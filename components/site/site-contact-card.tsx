import { CONTACT } from '@/lib/site-content';

/**
 * Every contact affordance is a working link — tel:, mailto:, or a map.
 * There is no form here on purpose: nothing on this site may appear to submit
 * something it cannot durably deliver.
 */
export function SiteContactCard() {
  return (
    <div className="site-contact-card">
      <div className="site-contact-group">
        <p className="site-eyebrow">Call</p>
        <a className="site-contact-primary clinical-focus" href={CONTACT.tollFreeHref}>
          {CONTACT.tollFreeLabel}
        </a>
        <p className="site-contact-note">Toll free · {CONTACT.tollFreeDigits}</p>
        <a className="site-contact-link clinical-focus" href={CONTACT.localHref}>
          {CONTACT.localLabel}
        </a>
        <p className="site-contact-note">Local · Fax {CONTACT.faxLabel}</p>
      </div>

      <div className="site-contact-group">
        <p className="site-eyebrow">Email</p>
        <a className="site-contact-link clinical-focus" href={CONTACT.emailHref}>
          {CONTACT.email}
        </a>
      </div>

      <div className="site-contact-group">
        <p className="site-eyebrow">Visit</p>
        <address className="site-contact-address">
          {CONTACT.street}
          <br />
          {CONTACT.city}, {CONTACT.state} {CONTACT.postalCode}
        </address>
        <a
          className="site-contact-link clinical-focus"
          href={CONTACT.mapHref}
          target="_blank"
          rel="noreferrer"
        >
          Open In Maps
        </a>
      </div>
    </div>
  );
}
