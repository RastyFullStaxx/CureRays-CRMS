import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteSection } from '@/components/site/site-section';
import { SiteContactCard } from '@/components/site/site-contact-card';
import { CONDITIONS, SPECIALTY_AREAS, TREATMENTS } from '@/lib/site-content';

export const metadata: Metadata = {
  title: 'Conditions Treated',
  description:
    'CureRays treats skin cancer, hand arthritis, keloids, Dupuytren’s contracture, Ledderhose disease, and other conditions with non-invasive x-ray therapy.'
};

/** Which treatments name this condition, so each entry answers "and then what?". */
function treatmentsFor(condition: string) {
  return TREATMENTS.filter((treatment) =>
    treatment.appliesTo.some(
      (applies) =>
        applies.toLowerCase().includes(condition.toLowerCase()) ||
        condition.toLowerCase().includes(applies.toLowerCase())
    )
  );
}

export default function ConditionsPage() {
  return (
    <>
      {/* Hick: the list opens as titles only, so scanning twelve conditions stays
          cheap and the visitor chooses before reading detail. */}
      <SiteSection
        id="conditions"
        eyebrow="Conditions Treated"
        heading="What CureRays Treats"
        lead="Select any condition to see the therapy associated with it."
      >
        <ul className="site-disclosure-list">
          {CONDITIONS.map((condition) => {
            const related = treatmentsFor(condition);
            return (
              <li key={condition}>
                <details className="site-disclosure">
                  <summary className="site-disclosure-summary clinical-focus">
                    <span className="site-subhead">{condition}</span>
                    <span className="site-disclosure-marker" aria-hidden="true" />
                  </summary>
                  <div className="site-disclosure-body">
                    {related.length > 0 ? (
                      <>
                        <p className="site-eyebrow">Associated Therapy</p>
                        <ul className="site-tag-list site-tag-list-compact">
                          {related.map((treatment) => (
                            <li key={treatment.slug} className="site-tag">
                              {treatment.abbreviation} · {treatment.name}
                            </li>
                          ))}
                        </ul>
                      </>
                    ) : (
                      <p className="site-body">
                        Treatment for this condition is planned with you directly. Call the clinic
                        to discuss the approach.
                      </p>
                    )}
                  </div>
                </details>
              </li>
            );
          })}
        </ul>
        <Link className="site-inline-link clinical-focus" href="/treatments">
          See All Treatments
          <span aria-hidden="true">→</span>
        </Link>
      </SiteSection>

      <SiteSection
        id="specialties"
        tone="muted"
        eyebrow="Specialty Areas"
        heading="Across Six Specialties"
        lead="Radiation medicine at CureRays reaches beyond oncology."
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
        id="conditions-contact"
        tone="brand"
        eyebrow="Get In Touch"
        heading="Ask About Your Condition"
        lead="The care team can tell you whether x-ray therapy is an option for you."
      >
        <SiteContactCard />
      </SiteSection>
    </>
  );
}
