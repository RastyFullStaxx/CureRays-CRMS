'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useReducedMotion, useScroll, useSpring } from 'motion/react';
import { SiteNav } from '@/components/site/site-nav';
import { CLINIC, CONTACT } from '@/lib/site-content';

/**
 * Full-bleed header. It spans the whole row with a tight gutter and carries two
 * scroll behaviours: it condenses once the hero is behind it, and a brand rule
 * across the very top tracks reading progress.
 *
 * Jakob still governs the arrangement — mark on the left, telephone on the
 * right, five destinations between. The premium is in the material, not in a
 * novel layout a visitor would have to learn.
 */
export function SiteHeader() {
  const headerRef = useRef<HTMLElement>(null);
  const [condensed, setCondensed] = useState(false);
  const [over, setOver] = useState<'default' | 'brand'>('default');
  const reduced = useReducedMotion();

  // Publish the measured height so the hero can pull itself up underneath the
  // bar. Measured rather than hard-coded: the header changes height with the
  // viewport, and a stale constant would leave a bone gap above the field.
  useEffect(() => {
    const node = headerRef.current;
    if (!node) return;
    const publish = () => {
      document.documentElement.style.setProperty(
        '--site-header-h',
        `${Math.round(node.getBoundingClientRect().height)}px`
      );
    };
    publish();
    const observer = new ResizeObserver(publish);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });

  useEffect(() => {
    const onScroll = () => setCondensed(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // The bar carries no fill, so it has to know what is behind it. Anything with
  // a brand ground would swallow ink links; the header flips to bone over those.
  useEffect(() => {
    const toned = Array.from(
      document.querySelectorAll<HTMLElement>('[data-tone="brand"], .site-footer')
    );
    if (toned.length === 0) return;

    const check = () => {
      const band = 72;
      const covered = toned.some((node) => {
        const rect = node.getBoundingClientRect();
        return rect.top <= band && rect.bottom >= 0;
      });
      setOver(covered ? 'brand' : 'default');
    };

    check();
    window.addEventListener('scroll', check, { passive: true });
    window.addEventListener('resize', check, { passive: true });
    return () => {
      window.removeEventListener('scroll', check);
      window.removeEventListener('resize', check);
    };
  }, []);

  return (
    <header ref={headerRef} className="site-header" data-condensed={condensed} data-over={over}>
      <a className="site-skip-link clinical-focus" href="#site-main">
        Skip to content
      </a>

      {reduced ? null : (
        <motion.div className="site-header-progress" style={{ scaleX: progress }} aria-hidden="true" />
      )}

      <div className="site-header-inner">
        <Link className="site-wordmark clinical-focus" href="/">
          <span className="site-wordmark-mark">
            <Image src="/System_Logo.svg" alt="" width={38} height={38} priority />
          </span>
          <span className="site-wordmark-copy">
            <strong>{CLINIC.shortName}</strong>
            <span className="site-wordmark-sub">Radiation Medicine</span>
          </span>
        </Link>

        <SiteNav />

        <div className="site-header-actions">
          <Link className="site-header-staff clinical-focus" href="/login">
            Staff Login
          </Link>
          {/* Fitts: the telephone is the largest, most reachable target here. */}
          <a className="site-call clinical-focus" href={CONTACT.tollFreeHref}>
            <span className="site-call-pulse" aria-hidden="true" />
            <span className="site-call-label">{CONTACT.tollFreeLabel}</span>
          </a>
        </div>
      </div>
    </header>
  );
}
