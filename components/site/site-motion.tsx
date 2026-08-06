'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform
} from 'motion/react';
import { cn } from '@/lib/utils';

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

/**
 * Pointer-reactive light. The hero's warm wash follows the cursor a little, so
 * the page feels lit rather than painted. Falls back to a fixed wash.
 */
export function BeamField({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const x = useMotionValue(50);
  const y = useMotionValue(30);
  const springX = useSpring(x, { stiffness: 60, damping: 24 });
  const springY = useSpring(y, { stiffness: 60, damping: 24 });
  const background = useTransform(
    [springX, springY],
    ([px, py]: number[]) =>
      `radial-gradient(58% 62% at ${px}% ${py}%, color-mix(in srgb, var(--site-brand-lit) 42%, transparent), transparent 70%)`
  );

  useEffect(() => {
    if (reduced) return;
    const handle = (event: PointerEvent) => {
      const node = ref.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      x.set(((event.clientX - rect.left) / rect.width) * 100);
      y.set(((event.clientY - rect.top) / rect.height) * 100);
    };
    window.addEventListener('pointermove', handle, { passive: true });
    return () => window.removeEventListener('pointermove', handle);
  }, [reduced, x, y]);

  if (reduced) {
    return <div ref={ref} className={cn('site-beam site-beam-static', className)} aria-hidden="true" />;
  }

  return (
    <motion.div ref={ref} className={cn('site-beam', className)} style={{ background }} aria-hidden="true" />
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
