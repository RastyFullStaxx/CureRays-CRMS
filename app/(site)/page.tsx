import Link from 'next/link';
import { SiteSection } from '@/components/site/site-section';
import { SiteContactCard } from '@/components/site/site-contact-card';
import { SiteGallery } from '@/components/site/site-gallery';
import { CohortField } from '@/components/site/cohort-field';
import { PATIENT_INFORMATION_IS_PUBLISHABLE } from '@/lib/site-patient-information';
import { ConditionMap } from '@/components/site/condition-map';
import { FounderPortrait, RatingBadge, Testimonials } from '@/components/site/site-trust';
import { SiteHeroField } from '@/components/site/site-hero-field';
import { TreatmentExplorer } from '@/components/site/treatment-explorer';
import { Counter, Drift, Reveal } from '@/components/site/site-motion';
import {
  CLINIC,
  CONTACT,
  FOUNDER,
  PRACTICE_FACTS,
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

          {/* The four treatment attributes used to be chipped here as well as
              in the gallery below. Same four words twice in one scroll; they
              live in the gallery now, where each also carries its sentence. */}
          <Reveal delay={0.28}>
            <div className="site-hero-actions">
              <a
                className="site-button site-button-primary clinical-focus"
                href={CONTACT.tollFreeHref}
              >
                Schedule A Consultation
              </a>
              {/* Points at the answers once the clinic has written them, and at
                  the modality list until then — so the second CTA is never a
                  link to a page of unanswered questions. */}
              <Link
                className="site-button site-button-ghost clinical-focus"
                href={PATIENT_INFORMATION_IS_PUBLISHABLE ? '/patient-information' : '/treatments'}
              >
                {PATIENT_INFORMATION_IS_PUBLISHABLE
                  ? 'What To Expect'
                  : 'See How CureRays Works'}
              </Link>
            </div>
          </Reveal>

          <Reveal delay={0.34}>
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
        id="conditions"
        tone="muted"
        eyebrow="Conditions Treated"
        heading="More Than Cancer"
        lead="X-ray therapy treats a range of malignant and benign conditions across several specialties."
        action={
          <Link className="site-inline-link clinical-focus" href="/conditions">
            Explore Conditions
            <span aria-hidden="true">→</span>
          </Link>
        }
      >
        <ConditionMap />
      </SiteSection>

      <SiteSection
        id="treatments"
        layout="stack"
        eyebrow="Treatments"
        heading="Radiation Medicine, Matched To The Condition"
        lead="From superficial skin therapy to image-guided treatment, each modality is chosen for what it treats best."
        action={
          <Link className="site-inline-link clinical-focus" href="/treatments">
            All Treatments
            <span aria-hidden="true">→</span>
          </Link>
        }
      >
        <TreatmentExplorer treatments={TREATMENTS.slice(0, 4)} />
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
                {/* Renders nothing until the clinic supplies a portrait. */}
                <FounderPortrait />
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

          {/* The section's proof is its figures, so the visual is made of them:
              1,500 marks, one per patient served. Full width beneath both
              columns — the figures end well short of the copy, and anything
              narrower left a dead quadrant under them. */}
          <Reveal delay={0.24} className="site-cohort-reveal">
            <CohortField />
          </Reveal>

          {/* The 5-star figure above stands on nothing until the clinic supplies
              a real score and quotes it has the right to republish. Both render
              nothing until then. */}
          <div className="site-cohort-reveal">
            <RatingBadge />
            <Testimonials />
          </div>
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
