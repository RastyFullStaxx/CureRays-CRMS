/**
 * The questions a patient actually arrives with, and their answers.
 *
 * A site audit found that of nineteen common pre-appointment questions, the site
 * answered two. Insurance, cost, referral, first visit, what to expect, session
 * length, side effects and candidacy were all absent.
 *
 * Most of those answers are **facts about a real medical practice** — what it
 * bills, what it accepts, what a session involves — and cannot be written by
 * anyone but the clinic. So each answer carries its provenance, and only
 * `published` answers ever reach a visitor. A `pending` entry is a question the
 * clinic still has to answer; it renders nowhere, and the page it belongs to
 * stays out of the navigation and the sitemap until enough of its section is
 * filled in.
 *
 * That is deliberate: an unanswered question is better than an invented answer,
 * and a plausible-sounding guess about insurance coverage is the single most
 * damaging thing this file could contain.
 *
 * **To publish an answer:** replace `pending: true` with the text and a `source`
 * naming where the clinic published or confirmed it.
 */

export type Answer = {
  readonly question: string;
  /** Present only once the clinic has supplied it. */
  readonly answer?: string;
  /** Where the wording came from. Required whenever `answer` is set. */
  readonly source?: string;
  /** True while the clinic still owes an answer. Never rendered. */
  readonly pending?: true;
};

export type InformationSection = {
  readonly id: string;
  readonly title: string;
  readonly lead: string;
  readonly answers: readonly Answer[];
};

export const PATIENT_INFORMATION: readonly InformationSection[] = [
  {
    id: 'what-to-expect',
    title: 'What Treatment Is Like',
    lead: 'What the therapy involves, in the clinic’s own words.',
    answers: [
      {
        question: 'Is there an incision?',
        answer: 'No. Therapy is delivered without an incision.',
        source: 'CureRays published treatment attributes — “Invisible”'
      },
      {
        question: 'Does it hurt, and will I be sedated?',
        answer: 'Sessions are non-invasive and anesthesia-free.',
        source: 'CureRays published treatment attributes — “Painless”'
      },
      {
        question: 'Will it leave a scar?',
        answer: 'Treatment leaves no surgical scar behind.',
        source: 'CureRays published treatment attributes — “Scar-Free”'
      },
      { question: 'How long does a single session take?', pending: true },
      { question: 'How many sessions will I need?', pending: true },
      { question: 'Can I drive myself home afterwards?', pending: true },
      { question: 'What side effects should I expect?', pending: true },
      { question: 'Can I work during my course of treatment?', pending: true }
    ]
  },
  {
    id: 'cost-and-insurance',
    title: 'Cost And Insurance',
    lead: 'What treatment costs and which plans the practice accepts.',
    answers: [
      { question: 'Do you accept Medicare?', pending: true },
      { question: 'Which insurance plans do you accept?', pending: true },
      { question: 'What does treatment cost without insurance?', pending: true },
      { question: 'Will you check my coverage before I start?', pending: true },
      { question: 'Do you offer payment plans?', pending: true }
    ]
  },
  {
    id: 'is-this-for-me',
    title: 'Whether This Is For You',
    lead: 'Who the therapy suits, and how to find out.',
    answers: [
      {
        question: 'Which conditions do you treat?',
        answer:
          'Skin cancer, ossification, hand arthritis, fasciitis, contracture, Peyronie’s disease, keloids, gynecomastia, Ledderhose disease, Graves’ eye disease, select infections, and desmoid fibromatosis.',
        source: 'CureRays published conditions list'
      },
      { question: 'Do I need a referral from my doctor?', pending: true },
      { question: 'Who is not a candidate for this therapy?', pending: true },
      { question: 'Can I have this if I have had radiation before?', pending: true }
    ]
  },
  {
    id: 'first-visit',
    title: 'Your First Visit',
    lead: 'What to bring and what happens when you arrive.',
    answers: [
      {
        question: 'Where is the clinic?',
        answer:
          '300 Sierra College Drive Suite 150, Grass Valley, CA 95945-5723.',
        source: 'CureRays published address'
      },
      { question: 'What are your opening hours?', pending: true },
      { question: 'What should I bring to my first appointment?', pending: true },
      { question: 'How long is the first appointment?', pending: true },
      { question: 'Is there parking on site?', pending: true },
      { question: 'Can someone come with me?', pending: true }
    ]
  }
];

/** Answers cleared for publication. Everything else is withheld by design. */
export function publishedAnswers(section: InformationSection) {
  return section.answers.filter((entry) => entry.answer !== undefined);
}

/**
 * A section reaches visitors only once it can answer something. Below that it
 * would be a page of headings, which reads as an abandoned site and ranks worse
 * than having no page at all.
 */
export function publishedSections() {
  return PATIENT_INFORMATION.filter((section) => publishedAnswers(section).length > 0);
}

/** True when enough of the page is filled in to belong in nav and the sitemap. */
export const PATIENT_INFORMATION_IS_PUBLISHABLE =
  publishedSections().length >= PATIENT_INFORMATION.length;

/** What the clinic still owes, for the handover checklist. */
export function pendingQuestions() {
  return PATIENT_INFORMATION.flatMap((section) =>
    section.answers
      .filter((entry) => entry.pending)
      .map((entry) => ({ section: section.title, question: entry.question }))
  );
}
