import Image from 'next/image';
import Link from 'next/link';
import { SiteSection } from '@/components/site/site-section';
import { SiteStatRow } from '@/components/site/site-stat-row';
import { SiteContactCard } from '@/components/site/site-contact-card';
import {
  CLINIC,
  CONDITIONS,
  CONTACT,
  FOUNDER,
  TREATMENTS,
  TREATMENT_ATTRIBUTES
} from '@/lib/site-content';

export default function HomePage() {
  return (
    <>
      <section className="site-hero" aria-labelledby="hero-heading">
        <div className="site-hero-inner">
          <p className="site-eyebrow">{CLINIC.name}</p>
          <h1 id="hero-heading" className="site-display">
            {CLINIC.tagline}
          </h1>
          <p className="site-hero-lead">{CLINIC.belief}</p>
          <p className="site-hero-motto">{CLINIC.motto}</p>

          {/* Hick: one primary action, one secondary. Nothing else competes. */}
          <div className="site-hero-actions">
            <a className="site-button site-button-primary clinical-focus" href={CONTACT.tollFreeHref}>
              Schedule A Consultation
            </a>
            <Link className="site-button site-button-ghost clinical-focus" href="/treatments">
              See How CureRays Works
            </Link>
          </div>
        </div>

        {/* Shown from 1160px only. The site has no clinical photography, so the
            hero anchors on the existing abstract brand asset rather than stock
            imagery of patients we do not have permission to depict. */}
        <div className="site-hero-media" aria-hidden="true">
          <Image
            src="/curerays-treatment-geometry.png"
            alt=""
            width={1717}
            height={916}
            priority
            sizes="(max-width: 1159px) 0px, 46vw"
          />
        </div>
      </section>

      <SiteSection
        id="attributes"
        tone="ink"
        eyebrow="Non-Invasive X-Ray Therapy"
        heading="Treatment You Can Return To Work After"
        lead="CureRays delivers therapy that reaches the condition without an incision."
      >
        <ul className="site-attribute-grid">
          {TREATMENT_ATTRIBUTES.map((attribute) => (
            <li key={attribute.name} className="site-attribute">
              <p className="site-attribute-name">{attribute.name}</p>
              <p className="site-body">{attribute.detail}</p>
            </li>
          ))}
        </ul>
      </SiteSection>

      <SiteSection
        id="treatments"
        eyebrow="Treatments"
        heading="Radiation Medicine, Matched To The Condition"
        lead="From superficial skin therapy to image-guided treatment, each modality is chosen for what it treats best."
      >
        <ul className="site-card-grid">
          {TREATMENTS.slice(0, 4).map((treatment) => (
            <li key={treatment.slug} className="site-card">
              <p className="site-card-tag">{treatment.abbreviation}</p>
              <h3 className="site-subhead">{treatment.name}</h3>
              <p className="site-body">{treatment.summary}</p>
            </li>
          ))}
        </ul>
        <Link className="site-inline-link clinical-focus" href="/treatments">
          All Treatments
          <span aria-hidden="true">→</span>
        </Link>
      </SiteSection>

      <SiteSection
        id="conditions"
        tone="muted"
        eyebrow="Conditions Treated"
        heading="More Than Cancer"
        lead="X-ray therapy treats a range of malignant and benign conditions across several specialties."
      >
        <ul className="site-tag-list">
          {CONDITIONS.map((condition) => (
            <li key={condition} className="site-tag">
              {condition}
            </li>
          ))}
        </ul>
        <Link className="site-inline-link clinical-focus" href="/conditions">
          Explore Conditions
          <span aria-hidden="true">→</span>
        </Link>
      </SiteSection>

      <SiteSection
        id="practice"
        eyebrow="The Practice"
        heading="A Team Built Around Access"
        lead={CLINIC.purpose}
      >
        <SiteStatRow />
        <div className="site-founder">
          <p className="site-eyebrow">{FOUNDER.role}</p>
          <p className="site-founder-name">{FOUNDER.name}</p>
          <p className="site-body">
            {FOUNDER.credential} with {FOUNDER.experience}.
          </p>
          <Link className="site-inline-link clinical-focus" href="/about">
            About CureRays
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </SiteSection>

      <SiteSection
        id="contact"
        tone="ink"
        eyebrow="Get In Touch"
        heading={CLINIC.promise}
        lead="Call, email, or visit the Grass Valley clinic. A member of the team will help you find the right next step."
      >
        <SiteContactCard />
      </SiteSection>
    </>
  );
}
