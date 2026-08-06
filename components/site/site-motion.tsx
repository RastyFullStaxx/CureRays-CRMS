'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  animate,
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useTransform
} from 'motion/react';

/**
 * Motion primitives for the public site.
 *
 * Restraint is the rule: the authored moment is the aperture gallery, so
 * everything else enters once, quietly, and gets out of the way. Every export
 * checks `useReducedMotion()` and renders a static equivalent rather than a
 * faster animation — the setting means "no motion", not "less".
 */

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

/** Single shared entrance. One rise, one settle, never a per-section novelty. */
export function Reveal({
  children,
  delay = 0,
  className,
  as = 'div'
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: 'div' | 'section' | 'li' | 'span';
}) {
  const reduced = useReducedMotion();
  const Component = motion[as];

  if (reduced) {
    return <Component className={className}>{children}</Component>;
  }

  return (
    <Component
      className={className}
      initial={{ opacity: 0, y: 22, filter: 'blur(6px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: '-12% 0px -8% 0px' }}
      transition={{ duration: 0.85, delay, ease: EASE_OUT }}
    >
      {children}
    </Component>
  );
}

/** Counts a published figure up once it is on screen. Static under reduced motion. */
export function Counter({ value, className }: { value: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 'some' });
  const reduced = useReducedMotion();
  // Starts on the real figure, so it is correct before hydration and stays
  // correct if scripting never runs.
  const [shown, setShown] = useState(value);

  useEffect(() => {
    if (!inView || reduced) return;

    // Parse inside the effect. Deriving `match` in render would hand the effect a
    // fresh array each pass, and since every frame calls setShown, the animation
    // would restart from zero forever and never settle on the real figure.
    const match = value.match(/^([^\d]*)([\d,]+)(.*)$/);
    if (!match) return;
    const target = Number(match[2].replace(/,/g, ''));
    if (!Number.isFinite(target)) return;

    const controls = animate(0, target, {
      duration: 1.4,
      ease: EASE_OUT,
      onUpdate: (latest) => {
        setShown(`${match[1]}${Math.round(latest).toLocaleString('en-US')}${match[3]}`);
      },
      // Snap back to the authored string so separators and casing are exact.
      onComplete: () => setShown(value)
    });

    return () => controls.stop();
  }, [inView, reduced, value]);

  return (
    <span ref={ref} className={className}>
      {shown}
    </span>
  );
}

/** Parallax wrapper. Drift is small on purpose — a hint of depth, not a ride. */
export function Drift({
  children,
  distance = 60,
  className
}: {
  children: ReactNode;
  distance?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start']
  });
  const y = useTransform(scrollYProgress, [0, 1], [distance, -distance]);

  if (reduced) {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    );
  }

  return (
    <div ref={ref} className={className}>
      <motion.div style={{ y }}>{children}</motion.div>
    </div>
  );
}
