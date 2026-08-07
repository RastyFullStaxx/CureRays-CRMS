'use client';

import { useState } from 'react';
import { CONDITIONS } from '@/lib/site-content';

/**
 * The conditions list, paired with a body map. Selecting a condition marks the
 * region it affects, which is the question a patient arrives with — "where is
 * this treated?" — and it is answerable without any photography.
 *
 * The figure is built from straight segments only, matching the site's angular
 * language, and is `aria-hidden`: the region is also stated in text beneath it,
 * so nothing here is available only by pointing at a drawing.
 *
 * > **Site mapping needs clinical sign-off**, alongside the treatments figure.
 * > Most entries are given by the condition's own name — hand arthritis to the
 * > hands, Graves' eye disease to the head. Two are eponymous and rest on
 * > clinical knowledge rather than the words themselves (Ledderhose, Peyronie's).
 * > Anything whose name does not state a site is deliberately marked as
 * > occurring at multiple sites rather than being assigned one.
 */

type Region = 'head' | 'chest' | 'trunk' | 'pelvis' | 'hands' | 'feet' | 'skin' | 'multiple';

const SITE: Record<string, { regions: Region[]; label: string }> = {
  'Skin cancer': { regions: ['skin'], label: 'The skin, anywhere on the body' },
  Keloids: { regions: ['skin'], label: 'The skin, at the site of a scar' },
  'Hand arthritis': { regions: ['hands'], label: 'The hands' },
  "Graves' eye disease": { regions: ['head'], label: 'Around the eyes' },
  Gynecomastia: { regions: ['chest'], label: 'The chest' },
  'Ledderhose disease': { regions: ['feet'], label: 'The soles of the feet' },
  "Peyronie's disease": { regions: ['pelvis'], label: 'The pelvis' },
  Ossification: { regions: ['multiple'], label: 'Occurs at several sites' },
  Fasciitis: { regions: ['multiple'], label: 'Occurs at several sites' },
  Contracture: { regions: ['multiple'], label: 'Occurs at several sites' },
  'Select infections': { regions: ['multiple'], label: 'Occurs at several sites' },
  'Desmoid fibromatosis': { regions: ['multiple'], label: 'Occurs at several sites' }
};

/** Highlight shapes, in the figure's own 200 x 430 space. Straight edges only. */
const SHAPES: Record<Exclude<Region, 'skin' | 'multiple'>, string> = {
  head: '100,14 120,30 120,58 100,74 80,58 80,30',
  chest: '76,86 124,86 132,116 68,116',
  trunk: '68,116 132,116 130,190 70,190',
  pelvis: '70,192 130,192 126,228 74,228',
  hands: '30,196 46,196 46,222 30,222',
  feet: '54,384 84,384 84,402 54,402'
};

/** Mirrored partners, so hands and feet mark both sides. */
const MIRRORED: Partial<Record<Region, string>> = {
  hands: '154,196 170,196 170,222 154,222',
  feet: '116,384 146,384 146,402 116,402'
};

/** The standing figure: outline only, drawn as polylines. */
const OUTLINE = [
  '100,14 120,30 120,58 100,74 80,58 80,30 100,14',
  '92,74 92,86',
  '108,74 108,86',
  '76,86 124,86 132,116 130,190 70,190 68,116 76,86',
  '78,88 52,104 40,160 36,196 36,222',
  '122,88 148,104 160,160 164,196 164,222',
  '70,190 74,228 78,300 70,384 54,384 54,402',
  '130,190 126,228 122,300 130,384 146,384 146,402'
];

export function ConditionMap() {
  const [active, setActive] = useState<string | null>(null);
  const entry = active ? SITE[active] : null;
  const regions = entry?.regions ?? [];

  return (
    <div className="site-condition-map">
      <ul className="site-tag-list">
        {CONDITIONS.map((condition) => (
          <li key={condition}>
            <button
              type="button"
              className="site-tag site-tag-button clinical-focus"
              data-active={condition === active}
              aria-pressed={condition === active}
              onMouseEnter={() => setActive(condition)}
              onMouseLeave={() => setActive(null)}
              onFocus={() => setActive(condition)}
              onClick={() => setActive(condition === active ? null : condition)}
            >
              {condition}
            </button>
          </li>
        ))}
      </ul>

      <figure className="site-body-figure">
        <svg viewBox="0 0 200 430" className="site-body-svg" aria-hidden="true" focusable="false">
          {/* Marked regions sit under the outline so the figure stays legible. */}
          {regions.map((region) => {
            if (region === 'skin' || region === 'multiple') return null;
            return (
              <g key={region} className="site-body-mark">
                <polygon points={SHAPES[region]} />
                {MIRRORED[region] ? <polygon points={MIRRORED[region]} /> : null}
              </g>
            );
          })}

          <g
            className="site-body-outline"
            data-skin={regions.includes('skin')}
            data-multiple={regions.includes('multiple')}
          >
            {OUTLINE.map((points) => (
              <polyline key={points} points={points} />
            ))}
          </g>
        </svg>

        <figcaption className="site-body-caption">
          {entry ? (
            <>
              <span className="site-body-caption-name">{active}</span>
              {entry.label}
            </>
          ) : (
            'Point at a condition to see where it is treated.'
          )}
        </figcaption>
      </figure>
    </div>
  );
}
