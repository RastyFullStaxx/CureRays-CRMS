import type { Metadata } from 'next';
import { SiteSection } from '@/components/site/site-section';
import { SiteContactCard } from '@/components/site/site-contact-card';
import { TREATMENTS } from '@/lib/site-content';

export const metadata: Metadata = {
  title: 'Treatments',
  description:
    'Superficial Radiation Therapy, low-dose therapy for arthritis, DEEP-SRT for Dupuytren’s contracture, and image-guided radiation therapy at CureRays Radiation Medicine.'
};

export default function TreatmentsPage() {
  return (
    <>
      {/* Tesler: the modality list is irreducible complexity, so it gets a full
          page rather than being buried in a navigation menu. */}
      <SiteSection
        id="treatments"
        eyebrow="Treatments"
        heading="Every Modality, And What It Treats"
        lead="Each therapy below is chosen for the condition it treats best. If you are unsure which applies to you, the care team will help you find out."
      >
        <ol className="site-treatment-list">
          {TREATMENTS.map((treatment, index) => (
            <li key={treatment.slug} id={treatment.slug} className="site-treatment">
              <p className="site-treatment-index" aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </p>
              <div className="site-treatment-body">
                <p className="site-card-tag">{treatment.abbreviation}</p>
                <h3 className="site-subhead">{treatment.name}</h3>
                <p className="site-body">{treatment.summary}</p>
                <ul className="site-tag-list site-tag-list-compact">
                  {treatment.appliesTo.map((applies) => (
                    <li key={applies} className="site-tag">
                      {applies}
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ol>
      </SiteSection>

      <SiteSection
        id="treatments-contact"
        tone="brand"
        eyebrow="Next Step"
        heading="Not Sure Which Applies To You?"
        lead="Call the clinic and a member of the care team will talk it through with you."
      >
        <SiteContactCard />
      </SiteSection>
    </>
  );
}
