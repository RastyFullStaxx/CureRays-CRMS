'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'motion/react';
import { Reveal } from '@/components/site/site-motion';
import {
  createField,
  drawField,
  retarget,
  type Palette
} from '@/components/site/modality-figure-renderers';
import type { Treatment } from '@/lib/site-content';

/**
 * The modality list, paired with a figure that reconfigures as you move through
 * it. Pointing at a row or tabbing to it retargets the field.
 *
 * The figure is decorative and `aria-hidden`: the list carries every word, and
 * nothing is available only by hovering. Below the two-column breakpoint the
 * canvas is hidden in CSS, which also parks its frame loop — the
 * IntersectionObserver reports a `display: none` element as not intersecting.
 */
export function TreatmentExplorer({ treatments }: { treatments: readonly Treatment[] }) {
  const [active, setActive] = useState(0);

  return (
    <div className="site-explorer">
      <ol className="site-modality-list">
        {treatments.map((treatment, index) => (
          <Reveal as="li" key={treatment.slug} delay={index * 0.06}>
            <Link
              href={`/treatments#${treatment.slug}`}
              className="site-modality clinical-focus"
              data-active={index === active}
              onMouseEnter={() => setActive(index)}
              onFocus={() => setActive(index)}
            >
              {/* The rail leads with what the modality treats, not just its
                  abbreviation: two of these four are both "SRT", and a column
                  of repeated initialisms reads as a duplication error while
                  answering none of the question a patient arrives with. */}
              <span className="site-modality-rail">
                <span className="site-modality-tag">{treatment.abbreviation}</span>
                {treatment.appliesTo.map((condition) => (
                  <span key={condition} className="site-modality-applies">
                    {condition}
                  </span>
                ))}
              </span>
              <span className="site-modality-body">
                <span className="site-subhead">{treatment.name}</span>
                <span className="site-body">{treatment.summary}</span>
              </span>
              <span className="site-modality-arrow" aria-hidden="true">
                →
              </span>
            </Link>
          </Reveal>
        ))}
      </ol>

      <ModalityFigure active={active} count={treatments.length} />
    </div>
  );
}

function ModalityFigure({ active, count }: { active: number; count: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();
  // Read by the frame loop without re-running the effect on every selection.
  const formation = useRef(0);
  const changedAt = useRef(0);
  /** Set by the frame effect so the reduced-motion path can force a redraw. */
  const settleRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    formation.current = active;
    changedAt.current = performance.now();
    if (reduced) settleRef.current?.();
  }, [active, reduced]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const styles = window.getComputedStyle(canvas);
    const token = (name: string) => styles.getPropertyValue(name).trim() || styles.color;
    // This section sits on the bone ground, so a travelling mark reads as more
    // prominent by going darker, not lighter.
    const palette: Palette = { hot: token('--site-brand-deep'), cool: token('--site-brand') };

    const field = createField(0);
    let shown = 0;
    let width = 0;
    let height = 0;
    let frame = 0;
    let running = false;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      if (!width || !height) return;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const paint = (now: number) => {
      if (shown !== formation.current) {
        shown = formation.current;
        retarget(field, shown);
      }
      const progress = Math.min(1, (now - changedAt.current) / 900);
      drawField(field, {
        ctx,
        width,
        height,
        time: now / 1000,
        progress,
        palette
      });
    };

    const step = () => {
      if (!running || !width || !height) return;
      paint(performance.now());
      frame = window.requestAnimationFrame(step);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        const shouldRun = entry.isIntersecting && !reduced;
        if (shouldRun && !running) {
          running = true;
          step();
        } else if (!shouldRun && running) {
          running = false;
          window.cancelAnimationFrame(frame);
        }
      },
      { threshold: 0 }
    );

    const resizeObserver = new ResizeObserver(() => {
      resize();
      if (reduced) settle();
    });

    // Reduced motion still gets each formation, just arrived at rather than
    // travelled to: run the easing to completion off-screen, then paint once.
    const settle = () => {
      if (!width || !height) return;
      retarget(field, formation.current);
      for (let i = 0; i < 90; i += 1) paint(changedAt.current + 900);
    };

    settleRef.current = settle;
    resize();
    resizeObserver.observe(canvas);
    observer.observe(canvas);
    if (reduced) settle();
    else {
      running = true;
      step();
    }

    return () => {
      running = false;
      settleRef.current = null;
      window.cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      observer.disconnect();
    };
  }, [reduced]);

  return (
    <div className="site-figure-panel" aria-hidden="true">
      <canvas ref={canvasRef} className="site-modality-canvas" />
      <span className="site-figure-index">
        {String(active + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}
      </span>
    </div>
  );
}
