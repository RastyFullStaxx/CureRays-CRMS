import Link from 'next/link';
import { AttributeIcon } from '@/components/site/site-attribute-icon';
import { SiteSection } from '@/components/site/site-section';
import { SiteContactCard } from '@/components/site/site-contact-card';
import { SiteGallery } from '@/components/site/site-gallery';
import { SiteHeroField } from '@/components/site/site-hero-field';
import { Counter, Drift, Reveal } from '@/components/site/site-motion';
import {
  CLINIC,
  CONDITIONS,
  CONTACT,
  FOUNDER,
  PRACTICE_FACTS,
  TREATMENT_ATTRIBUTES,
  TREATMENTS
} from '@/lib/site-content';

export default function HomePage() {
  return (
    <>
      <section className="site-hero" aria-labelledby="hero-heading">
        {/* The ground is a live vascular bed, not a photograph: it grows once, holds
            under a perfusion wave, then dissolves and grows again. */}
        <div className="site-hero-canvas" aria-hidden="true">
          <SiteHeroField />
          <span className="site-hero-veil" />
        </div>

        <div className="site-hero-inner">
          {/* The wordmark already names the clinic a row above, so the kicker
              spends itself on what a visitor actually cannot see: what the
              therapy is, and where it is. */}
          <Reveal>
            <p className="site-kicker">
              Non-Invasive X-Ray Therapy
              <span className="site-kicker-sep" aria-hidden="true" />
              {CONTACT.city}, California
            </p>
          </Reveal>

          <Reveal delay={0.08}>
            <h1 id="hero-heading" className="site-display">
              {CLINIC.tagline}
            </h1>
          </Reveal>

          <Reveal delay={0.16}>
            <p className="site-hero-lead">{CLINIC.belief}</p>
          </Reveal>

          <Reveal delay={0.22}>
            <p className="site-hero-support">{CLINIC.purpose}</p>
          </Reveal>

          {/* Miller: four attributes, the clinic's own words for what treatment
              feels like. They answer the question the headline provokes. */}
          <Reveal delay={0.28}>
            <ul className="site-hero-attributes">
              {TREATMENT_ATTRIBUTES.map((attribute) => (
                <li key={attribute.name} className="site-hero-attribute">
                  <AttributeIcon name={attribute.name} />
                  {attribute.name}
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={0.34}>
            <div className="site-hero-actions">
              <a
                className="site-button site-button-primary clinical-focus"
                href={CONTACT.tollFreeHref}
              >
                Schedule A Consultation
              </a>
              <Link className="site-button site-button-ghost clinical-focus" href="/treatments">
                See How CureRays Works
              </Link>
            </div>
          </Reveal>

          <Reveal delay={0.4}>
            <p className="site-hero-motto">{CLINIC.motto}</p>
          </Reveal>
        </div>
      </section>

      {/* The authored moment: four apertures opening on the therapy's own terms. */}
      <SiteSection
        id="attributes"
        tone="brand"
        layout="stack"
        heading="Treatment You Can Return To Work After"
        lead="Non-invasive x-ray therapy reaches the condition without an incision, without sedation, and without a recovery you have to plan your life around."
      >
        <SiteGallery />
      </SiteSection>

      <SiteSection
        id="treatments"
        eyebrow="Treatments"
        heading="Radiation Medicine, Matched To The Condition"
        lead="From superficial skin therapy to image-guided treatment, each modality is chosen for what it treats best."
      >
        <ol className="site-modality-list">
          {TREATMENTS.slice(0, 4).map((treatment, index) => (
            <Reveal as="li" key={treatment.slug} delay={index * 0.06}>
              <Link href={`/treatments#${treatment.slug}`} className="site-modality clinical-focus">
                <span className="site-modality-tag">{treatment.abbreviation}</span>
                <span className="site-modality-body">
                  <span className="site-subhead">{treatment.name}</span>
                  <span className="site-body">{treatment.summary}</span>
                </span>
                <span className="site-modality-arrow" aria-hidden="true">
                  →
                </span>
              </Link>
            </Reveal>
          ))}
        </ol>
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

      <section className="site-practice" aria-labelledby="practice-heading">
        <div className="site-practice-inner">
          <div className="site-practice-copy">
            <Reveal>
              <h2 id="practice-heading" className="site-headline">
                A Team Built Around Access
              </h2>
            </Reveal>
            <Reveal delay={0.08}>
              <p className="site-lead">{CLINIC.purpose}</p>
            </Reveal>

            <Reveal delay={0.16}>
              <div className="site-founder">
                <p className="site-founder-name">{FOUNDER.name}</p>
                <p className="site-body">
                  {FOUNDER.role} · {FOUNDER.credential} with {FOUNDER.experience}.
                </p>
                <Link className="site-inline-link clinical-focus" href="/about">
                  About CureRays
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            </Reveal>
          </div>

          <Drift className="site-practice-figures" distance={38}>
            <dl className="site-figure-stack">
              {PRACTICE_FACTS.map((fact) => (
                <div key={fact.label} className="site-figure">
                  <dt className="site-figure-value">
                    <Counter value={fact.value} />
                  </dt>
                  <dd>
                    <span className="site-figure-label">{fact.label}</span>
                    <span className="site-figure-detail">{fact.detail}</span>
                  </dd>
                </div>
              ))}
            </dl>
          </Drift>
        </div>
      </section>

      <SiteSection
        id="contact"
        tone="brand"
        heading={CLINIC.promise}
        lead="Call, email, or visit the Grass Valley clinic. A member of the team will help you find the right next step."
      >
        <SiteContactCard />
      </SiteSection>
    </>
  );
}
