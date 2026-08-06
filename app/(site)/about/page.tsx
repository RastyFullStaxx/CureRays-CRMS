import type { Metadata } from 'next';
import { SiteSection } from '@/components/site/site-section';
import { SiteStatRow } from '@/components/site/site-stat-row';
import { SiteContactCard } from '@/components/site/site-contact-card';
import { AWARDS, CLINIC, FOUNDER, PROGRAMS, SPECIALTY_AREAS } from '@/lib/site-content';

export const metadata: Metadata = {
  title: 'About',
  description:
    'CureRays Radiation Medicine was founded by Dr. Clayton B. Hess, MD MPH, a board-certified radiation oncologist, to expand access to non-invasive x-ray therapy.'
};

export default function AboutPage() {
  return (
    <>
      <SiteSection
        id="belief"
        eyebrow="About CureRays"
        heading="Why The Practice Exists"
        lead={CLINIC.belief}
      >
        <dl className="site-principle-list">
          <div className="site-principle">
            <dt className="site-eyebrow">Belief</dt>
            <dd className="site-principle-text">{CLINIC.belief}</dd>
          </div>
          <div className="site-principle">
            <dt className="site-eyebrow">Purpose</dt>
            <dd className="site-principle-text">{CLINIC.purpose}</dd>
          </div>
          <div className="site-principle">
            <dt className="site-eyebrow">Promise</dt>
            <dd className="site-principle-text">{CLINIC.promise}</dd>
          </div>
        </dl>
      </SiteSection>

      <SiteSection
        id="founder"
        tone="brand"
        eyebrow={FOUNDER.role}
        heading={FOUNDER.name}
        lead={`${FOUNDER.credential} with ${FOUNDER.experience}.`}
      >
        <SiteStatRow />
      </SiteSection>

      <SiteSection
        id="specialties"
        eyebrow="Specialty Areas"
        heading="Where Radiation Medicine Reaches"
        lead="The practice works across six specialties, treating malignant and benign conditions alike."
      >
        <ul className="site-tag-list">
          {SPECIALTY_AREAS.map((area) => (
            <li key={area} className="site-tag">
              {area}
            </li>
          ))}
        </ul>
      </SiteSection>

      <SiteSection
        id="recognition"
        tone="muted"
        eyebrow="Recognition"
        heading="Awards And Research"
        lead="Recognition earned by the practice and its founder."
      >
        <ul className="site-award-list">
          {AWARDS.map((award) => (
            <li key={award.name} className="site-award">
              <p className="site-award-name">{award.name}</p>
              <p className="site-body">{award.detail}</p>
            </li>
          ))}
        </ul>
      </SiteSection>

      <SiteSection
        id="programs"
        eyebrow="Programs"
        heading="Initiatives At CureRays"
        lead="Programs the practice runs alongside its clinical work."
      >
        <ul className="site-tag-list">
          {PROGRAMS.map((program) => (
            <li key={program} className="site-tag">
              {program}
            </li>
          ))}
        </ul>
      </SiteSection>

      <SiteSection
        id="about-contact"
        tone="brand"
        eyebrow="Get In Touch"
        heading={CLINIC.promise}
        lead="Reach the Grass Valley clinic directly."
      >
        <SiteContactCard />
      </SiteSection>
    </>
  );
}
