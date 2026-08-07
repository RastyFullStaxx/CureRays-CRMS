import type { Metadata } from 'next';
import { SiteSection } from '@/components/site/site-section';
import { SiteContactCard } from '@/components/site/site-contact-card';
import { sitePageMetadata } from '@/lib/site-metadata';
import { CONTACT, SOCIAL } from '@/lib/site-content';

export const metadata: Metadata = sitePageMetadata({
  title: 'Contact',
  description: `Contact CureRays Radiation Medicine at ${CONTACT.tollFreeLabel} or ${CONTACT.email}. ${CONTACT.street}, ${CONTACT.city}, ${CONTACT.state} ${CONTACT.postalCode}.`,
  path: '/contact'
});

export default function ContactPage() {
  return (
    <>
      <SiteSection
        level="h1"
        id="contact"
        eyebrow="Contact"
        heading="Schedule A Consultation"
        lead="Call, email, or visit the clinic in Grass Valley. Every number below dials the practice directly."
      >
        <SiteContactCard />
      </SiteSection>

      <SiteSection
        id="follow"
        tone="muted"
        eyebrow="Follow"
        heading="CureRays Online"
        lead="Updates from the practice."
      >
        <ul className="site-tag-list">
          {SOCIAL.map((social) => (
            <li key={social.name}>
              <a
                className="site-tag site-tag-link clinical-focus"
                href={social.href}
                target="_blank"
                rel="noreferrer"
              >
                {social.name}
              </a>
            </li>
          ))}
        </ul>
      </SiteSection>
    </>
  );
}
