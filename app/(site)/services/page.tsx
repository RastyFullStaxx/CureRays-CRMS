import type { Metadata } from 'next';
import { sitePageMetadata } from '@/lib/site-metadata';
import { SiteSection } from '@/components/site/site-section';
import { SiteContactCard } from '@/components/site/site-contact-card';
import { SERVICE_GROUPS } from '@/lib/site-content';

export const metadata: Metadata = sitePageMetadata({
  title: 'Services',
  description:
    'Cancer screenings, survivorship care, SkinIO body photos, ultrasound-guided biopsy, cryotherapy, osteoarthritis management, and clinical trials at CureRays.',
  path: '/services'
});

export default function ServicesPage() {
  return (
    <>
      <SiteSection
        level="h1"
        id="services"
        eyebrow="Medicine Services"
        heading="Care Around The Therapy"
        lead="Screening, procedures, medical management, and research sit alongside radiation treatment."
      >
        <div className="site-service-groups">
          {SERVICE_GROUPS.map((group) => (
            <section key={group.name} className="site-service-group">
              <h3 className="site-subhead">{group.name}</h3>
              <ul className="site-service-list">
                {group.services.map((service) => (
                  <li key={service} className="site-service">
                    {service}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </SiteSection>

      <SiteSection
        id="services-contact"
        tone="brand"
        eyebrow="Get In Touch"
        heading="Book A Screening"
        lead="Call the clinic to arrange a screening or ask about any of these services."
      >
        <SiteContactCard />
      </SiteSection>
    </>
  );
}
