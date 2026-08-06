'use client';

import Image from 'next/image';
import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { AttributeIcon } from '@/components/site/site-attribute-icon';
import { TREATMENT_ATTRIBUTES } from '@/lib/site-content';

/**
 * The site's one authored moment.
 *
 * Each panel opens like an aperture — a clip-path inset that retracts as the
 * panel enters view — and drifts at its own rate, so the group reads as light
 * arriving rather than four cards fading in together.
 *
 * The imagery is abstract light and material on purpose. CureRays has no
 * photography of its own here, and people staged as clinicians or patients would
 * misrepresent a real practice. Every factual claim lives in the copy, which
 * comes from what the clinic publishes; the pictures carry the idea.
 *
 * **Captions sit below the frame, never over it.** They used to be laid over the
 * image, and the parallax meant the pixels behind the text changed as you
 * scrolled — contrast was a different value at every scroll position, and
 * measured as low as 2.4:1 against a 3:1 requirement. Below the frame the pair
 * is bone-on-brand: fixed, and covered by `scripts/contrast-check.mjs`.
 */

const PANELS = [
  { src: '/site/beam.jpg', width: 1162, height: 768 },
  { src: '/site/diffuse.jpg', width: 1376, height: 768 },
  { src: '/site/grain.jpg', width: 768, height: 1376 },
  // Narrower than the others: the black side bands were trimmed at the source
  // once the frames became 4:3 and started showing them.
  { src: '/site/isodose.jpg', width: 614, height: 1376 }
] as const;

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

function Panel({
  panel,
  attribute,
  index
}: {
  panel: (typeof PANELS)[number];
  attribute: (typeof TREATMENT_ATTRIBUTES)[number];
  index: number;
}) {
  const ref = useRef<HTMLLIElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });

  // Alternating, uneven drift. Matching rates would read as one moving block.
  const depth = index % 2 === 0 ? 34 : 58;
  const y = useTransform(scrollYProgress, [0, 1], [depth, -depth]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1.08, 1.02, 1.08]);

  return (
    <li ref={ref} className="site-panel">
      <motion.figure
        className="site-panel-figure"
        /* `amount: 'some'` is threshold 0, and that is load-bearing rather than
           lazy. The frame starts clipped to zero height, so it reports an
           intersectionRatio of 0 — any fractional threshold could never be met
           and the panel would hide itself permanently. */
        initial={reduced ? undefined : { opacity: 0 }}
        whileInView={reduced ? undefined : { opacity: 1 }}
        viewport={{ once: true, amount: 'some' }}
        transition={{ duration: 0.7, delay: index * 0.09, ease: EASE_OUT }}
      >
        <motion.span
          className="site-panel-frame"
          initial={reduced ? undefined : { clipPath: 'inset(0 0 100% 0)' }}
          whileInView={reduced ? undefined : { clipPath: 'inset(0 0 0% 0)' }}
          viewport={{ once: true, amount: 'some' }}
          transition={{ duration: 1.1, delay: index * 0.09, ease: EASE_OUT }}
        >
          <motion.span className="site-panel-media" style={reduced ? undefined : { y, scale }}>
            <Image
              src={panel.src}
              alt=""
              width={panel.width}
              height={panel.height}
              sizes="(max-width: 767px) 100vw, (max-width: 1159px) 50vw, 42vw"
            />
          </motion.span>
          <span className="site-panel-glow" aria-hidden="true" />
        </motion.span>

        <figcaption className="site-panel-caption">
          <span className="site-panel-name">
            <AttributeIcon name={attribute.name} />
            {attribute.name}
          </span>
          <span className="site-panel-detail">{attribute.detail}</span>
        </figcaption>
      </motion.figure>
    </li>
  );
}

export function SiteGallery() {
  return (
    <ul className="site-panel-grid">
      {PANELS.map((panel, index) => (
        <Panel key={panel.src} panel={panel} attribute={TREATMENT_ATTRIBUTES[index]} index={index} />
      ))}
    </ul>
  );
}
