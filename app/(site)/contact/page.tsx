import type { Metadata } from 'next';
import { SiteSection } from '@/components/site/site-section';
import { SiteContactCard } from '@/components/site/site-contact-card';
import { CLINIC, CONTACT, SOCIAL } from '@/lib/site-content';

export const metadata: Metadata = {
  title: 'Contact',
  description: `Contact CureRays Radiation Medicine at ${CONTACT.tollFreeLabel} or ${CONTACT.email}. ${CONTACT.street}, ${CONTACT.city}, ${CONTACT.state} ${CONTACT.postalCode}.`
};

/**
 * Structured data lets search engines surface the clinic's real phone number and
 * address. It restates only what this page already shows.
 */
const clinicJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'MedicalClinic',
  name: CLINIC.name,
  slogan: CLINIC.tagline,
  telephone: CONTACT.tollFreeDigits,
  faxNumber: CONTACT.faxLabel,
  email: CONTACT.email,
  medicalSpecialty: 'RadiationOncology',
  address: {
    '@type': 'PostalAddress',
    streetAddress: CONTACT.street,
    addressLocality: CONTACT.city,
    addressRegion: CONTACT.state,
    postalCode: CONTACT.postalCode,
    addressCountry: 'US'
  },
  sameAs: SOCIAL.map((social) => social.href)
};

export default function ContactPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(clinicJsonLd) }}
      />

      <SiteSection
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
