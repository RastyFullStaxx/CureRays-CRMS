'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import { useReducedMotion } from 'motion/react';

/**
 * Weighted scrolling for the public site.
 *
 * Lenis intercepts wheel and touch input and eases the scroll position instead
 * of jumping it. It is most of what reads as "premium" on the reference sites —
 * more than any individual animation — and it is brand-neutral, so it costs the
 * design nothing.
 *
 * Three things keep it from being user-hostile, and all three matter:
 *
 * - **Reduced motion disables it entirely.** Hijacked scrolling is a common
 *   motion-sickness trigger; a preference against motion has to switch it off,
 *   not soften it.
 * - **Anchor jumps stay instant.** `#id` navigation is wayfinding, not
 *   decoration, and easing a jump to a section makes a keyboard user wait.
 * - **The authenticated app never gets it.** This mounts from the site layout
 *   only. Clinical work is not improved by inertia.
 */
export function SiteSmoothScroll() {
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;

    const lenis = new Lenis({
      // Short enough to stay responsive; long enough to read as weight rather
      // than lag. Past ~0.15 the page starts to feel like it is resisting you.
      lerp: 0.12,
      wheelMultiplier: 1,
      touchMultiplier: 1.6,
      // Let touch devices keep their native momentum — mobile browsers already
      // do this well, and overriding it fights the platform.
      syncTouch: false
    });

    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = window.requestAnimationFrame(raf);
    };
    frame = window.requestAnimationFrame(raf);

    // In-page anchors should land immediately.
    const onClick = (event: MouseEvent) => {
      const anchor = (event.target as HTMLElement | null)?.closest?.('a[href^="#"]');
      const href = anchor?.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      event.preventDefault();
      lenis.scrollTo(target as HTMLElement, { immediate: true });
    };
    document.addEventListener('click', onClick);

    return () => {
      document.removeEventListener('click', onClick);
      window.cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, [reduced]);

  return null;
}
