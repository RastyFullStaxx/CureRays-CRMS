import Image from 'next/image';
import { RATING, SITE_ASSETS, TESTIMONIALS, type SiteImage } from '@/lib/site-assets';

/**
 * Slots for the practice's own photography and patient quotes.
 *
 * Each returns `null` while its asset is missing, so the surrounding layout
 * closes up rather than reserving a hole. Nothing here degrades into a
 * placeholder — a grey rectangle where a clinician should be is worse than no
 * clinician at all, and a stock stand-in on a real practice's site is a
 * misrepresentation.
 */

function Plate({ image, className }: { image: SiteImage; className: string }) {
  return (
    <Image
      className={className}
      src={image.src}
      alt={image.alt}
      width={image.width}
      height={image.height}
      sizes="(max-width: 767px) 100vw, 40vw"
    />
  );
}

/** The founder's portrait, beside their name. Renders nothing until supplied. */
export function FounderPortrait() {
  const portrait = SITE_ASSETS.founderPortrait;
  if (!portrait) return null;
  return (
    <figure className="site-portrait">
      <Plate image={portrait} className="site-portrait-image" />
    </figure>
  );
}

/** The room a patient will actually sit in. Renders nothing until supplied. */
export function ClinicPlate({ which }: { which: 'clinicExterior' | 'treatmentRoom' }) {
  const image = SITE_ASSETS[which];
  if (!image) return null;
  return (
    <figure className="site-clinic-plate">
      <Plate image={image} className="site-clinic-plate-image" />
      {image.alt ? <figcaption className="site-body">{image.alt}</figcaption> : null}
    </figure>
  );
}

/**
 * The published rating, with its review count, platform and a link to check it.
 *
 * The stars are chevrons rather than five-pointed stars: a star is built from
 * arcs and points that read as round at this size, and the site carries no
 * circular edges. Partial fill is done with a clip on the last mark, so a 4.8
 * shows as 4.8 rather than being rounded to five.
 */
export function RatingBadge() {
  if (!RATING) return null;
  const { score, outOf, count, platform, href } = RATING;
  const filled = (score / outOf) * 5;

  return (
    <a className="site-rating clinical-focus" href={href} target="_blank" rel="noreferrer">
      <span className="site-rating-score">{score.toFixed(1)}</span>
      <span className="site-rating-marks" aria-hidden="true">
        {Array.from({ length: 5 }, (_, i) => (
          <span
            key={i}
            className="site-rating-mark"
            style={{ '--fill': `${Math.max(0, Math.min(1, filled - i)) * 100}%` } as React.CSSProperties}
          />
        ))}
      </span>
      <span className="site-rating-meta">
        {score} out of {outOf} from {count.toLocaleString()} reviews on {platform}
      </span>
    </a>
  );
}

/**
 * Patient quotes. Until this has entries, the rating figure stands on its own
 * with nothing behind it — which is the weakest form the claim can take, and
 * why filling this matters.
 */
export function Testimonials() {
  if (TESTIMONIALS.length === 0) return null;
  return (
    <ul className="site-quote-list">
      {TESTIMONIALS.map((entry) => (
        <li key={entry.quote} className="site-quote">
          <blockquote className="site-quote-body">{entry.quote}</blockquote>
          <p className="site-quote-attribution">
            {entry.attribution}
            <span className="site-quote-source">{entry.source}</span>
          </p>
        </li>
      ))}
    </ul>
  );
}
