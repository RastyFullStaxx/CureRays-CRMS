/**
 * Photography of the practice, and quotes from its patients.
 *
 * The site ships with none of this. That is the largest trust gap it has — a
 * medical practice with no visible people or premises reads as unfinished — but
 * every item here has to come from the clinic, and the honest way to wait for it
 * is to render nothing rather than a placeholder.
 *
 * So each slot is `null` or empty, and every component that consumes one renders
 * **nothing at all** while it stays that way. No grey boxes, no "photo coming
 * soon", no stock stand-in that a visitor could mistake for the real clinic.
 * Dropping a file into `public/site/` and naming it here is the whole change.
 *
 * > Patient clinical photographs cannot be used on this site. A clinical
 * > photograph is PHI, and marketing use of PHI requires written authorization
 * > under HIPAA §164.508. Licensed stock or images with a signed release only.
 * > See docs/product/public-site-content-gaps.md.
 */

export type SiteImage = {
  readonly src: string;
  readonly width: number;
  readonly height: number;
  /** Describe what is shown. Empty only if the image is purely decorative. */
  readonly alt: string;
};

export type Testimonial = {
  readonly quote: string;
  /** How the patient is credited. Never invent one. */
  readonly attribution: string;
  /** Where it was published — a review platform, or a signed consent on file. */
  readonly source: string;
};

export const SITE_ASSETS: {
  readonly founderPortrait: SiteImage | null;
  readonly careTeam: readonly SiteImage[];
  readonly clinicExterior: SiteImage | null;
  readonly treatmentRoom: SiteImage | null;
} = {
  founderPortrait: null,
  careTeam: [],
  clinicExterior: null,
  treatmentRoom: null
};

/**
 * Published patient quotes. Empty, and it must stay empty until the clinic
 * supplies quotes it has the right to republish — a review the patient posted
 * publicly, or a testimonial with consent on file. Do not lift text from Yelp
 * or Google: that is the platform's content, and a patient review reproduced
 * without consent is a privacy problem as well as a licensing one.
 */
export const TESTIMONIALS: readonly Testimonial[] = [];
