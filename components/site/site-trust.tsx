import Image from 'next/image';
import { SITE_ASSETS, TESTIMONIALS, type SiteImage } from '@/lib/site-assets';

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
 * Patient quotes. The homepage states a five-star rating; until this has
 * entries, that figure stands on its own with nothing behind it — which is the
 * weakest form the claim can take, and why filling this matters.
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
