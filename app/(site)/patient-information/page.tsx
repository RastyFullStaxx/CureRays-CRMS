import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteSection } from '@/components/site/site-section';
import { SiteContactCard } from '@/components/site/site-contact-card';
import { sitePageMetadata } from '@/lib/site-metadata';
import {
  PATIENT_INFORMATION_IS_PUBLISHABLE,
  publishedAnswers,
  publishedSections
} from '@/lib/site-patient-information';
import { CONTACT } from '@/lib/site-content';

/**
 * The questions patients ask before they call.
 *
 * One page with anchored sections rather than six thin ones. At this content
 * volume six separate routes would each be a few hundred words, which competes
 * with itself in search and gives a visitor five extra clicks to find one
 * answer. Split them out when any section outgrows the page.
 *
 * Only answers the clinic has published appear. Outstanding questions are held
 * in `lib/site-patient-information.ts` and render nowhere — see that file.
 */

export const metadata: Metadata = {
  ...sitePageMetadata({
    title: 'Patient Information',
    description:
      'What treatment at CureRays involves, what to bring to your first visit, and how to find out whether x-ray therapy is an option for you.',
    path: '/patient-information'
  }),
  // Withheld from search until the clinic has completed the answers. Publishing
  // a half-answered page is worse for the practice than publishing none.
  robots: PATIENT_INFORMATION_IS_PUBLISHABLE ? { index: true, follow: true } : { index: false, follow: true }
};

export default function PatientInformationPage() {
  const sections = publishedSections();

  return (
    <>
      <SiteSection
        level="h1"
        id="patient-information"
        eyebrow="Patient Information"
        heading="Before You Come In"
        lead="What treatment involves, and how to find out whether it is an option for you. If your question is not answered here, the care team will answer it on the phone."
        action={
          <a className="site-inline-link clinical-focus" href={CONTACT.tollFreeHref}>
            {CONTACT.tollFreeLabel}
            <span aria-hidden="true">→</span>
          </a>
        }
      >
        <ul className="site-answer-index">
          {sections.map((section) => (
            <li key={section.id}>
              <Link className="site-tag clinical-focus" href={`#${section.id}`}>
                {section.title}
              </Link>
            </li>
          ))}
        </ul>
      </SiteSection>

      {sections.map((section, index) => (
        <SiteSection
          key={section.id}
          id={section.id}
          tone={index % 2 === 0 ? 'muted' : 'default'}
          heading={section.title}
          lead={section.lead}
        >
          <dl className="site-answer-list">
            {publishedAnswers(section).map((entry) => (
              <div key={entry.question} className="site-answer">
                <dt className="site-subhead">{entry.question}</dt>
                <dd className="site-body">{entry.answer}</dd>
              </div>
            ))}
          </dl>
        </SiteSection>
      ))}

      <SiteSection
        id="ask"
        tone="brand"
        heading="Ask Us Anything Else"
        lead="A member of the care team will talk it through with you. There is no form here — the phone reaches the practice directly."
      >
        <SiteContactCard />
      </SiteSection>
    </>
  );
}
