import { CLINIC, CONTACT, SOCIAL } from '@/lib/site-content';

/**
 * `MedicalClinic` structured data, rendered on every public page.
 *
 * It used to sit on `/contact` alone, so a search engine landing on any of the
 * other five routes saw no telephone, no address and no clinic entity at all —
 * which is most of the point of local structured data for a practice.
 *
 * It restates only what the site already publishes; nothing here is a new claim.
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
  hasMap: CONTACT.mapHref,
  sameAs: SOCIAL.map((social) => social.href)
};

export function SiteStructuredData() {
  // Every value above is a compile-time constant, so nothing here is attacker
  // controlled — but `</script>` inside any JSON string would still close the
  // tag early and drop the remainder into the document as markup. Escaping `<`
  // makes that structurally impossible rather than merely unlikely today.
  const json = JSON.stringify(clinicJsonLd).replace(/</g, '\\u003c');
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
