'use client';

import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'motion/react';

/**
 * One mark per patient served, drawn from the figures the clinic publishes:
 * 1,500 marks in all, with 300 picked out for the annual cohort.
 *
 * The section's proof is its numbers, so the visual is made of the numbers
 * rather than decorating them — nothing here is invented, and the two counts
 * are the same two the adjacent figures state.
 *
 * The reveal runs once and then the loop stops. There is nothing to animate
 * afterwards, and a 1,500-stroke frame repeating forever behind static content
 * would be pure waste.
 */

const TOTAL = 1500;
const RECENT = 300;
const REVEAL_MS = 1400;

export function CohortField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const styles = window.getComputedStyle(canvas);
    const token = (name: string) => styles.getPropertyValue(name).trim() || styles.color;
    const recent = token('--site-brand');
    const earlier = token('--site-brand-lit');

    let width = 0;
    let height = 0;
    let cols = 0;
    let rows = 0;
    let frame = 0;
    let startedAt = 0;
    let done = false;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      if (!width || !height) return;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      // Choose a column count that keeps the cell close to square, so the grid
      // reads as a field rather than as stripes at any container width.
      cols = Math.max(24, Math.round(Math.sqrt((TOTAL * width) / height)));
      rows = Math.ceil(TOTAL / cols);
    };

    const paint = (progress: number) => {
      if (!width || !height) return;
      ctx.clearRect(0, 0, width, height);
      ctx.lineCap = 'butt';
      const cw = width / cols;
      const ch = height / rows;
      const tick = Math.min(ch * 0.62, 7);
      const shown = Math.round(TOTAL * progress);

      for (let i = 0; i < shown; i += 1) {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = Math.round(col * cw + cw / 2) + 0.5;
        const y = row * ch + (ch - tick) / 2;
        const isRecent = i >= TOTAL - RECENT;
        ctx.strokeStyle = isRecent ? recent : earlier;
        ctx.globalAlpha = isRecent ? 0.9 : 0.5;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + tick);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    };

    const step = () => {
      const elapsed = performance.now() - startedAt;
      const t = Math.min(1, elapsed / REVEAL_MS);
      paint(t * t * (3 - 2 * t));
      if (t >= 1) {
        done = true;
        return;
      }
      frame = window.requestAnimationFrame(step);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || done) return;
        if (reduced) {
          done = true;
          paint(1);
          return;
        }
        startedAt = performance.now();
        step();
      },
      { threshold: 0.15 }
    );

    const resizeObserver = new ResizeObserver(() => {
      resize();
      // Re-paint at whatever state the reveal has reached, so a resize mid-run
      // does not blank the field.
      if (done) paint(1);
    });

    resize();
    resizeObserver.observe(canvas);
    observer.observe(canvas);

    return () => {
      window.cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      observer.disconnect();
    };
  }, [reduced]);

  return (
    <figure className="site-cohort">
      <canvas ref={canvasRef} className="site-cohort-canvas" aria-hidden="true" />
      <figcaption className="site-cohort-caption">
        One mark per patient served, with the most recent year picked out.
      </figcaption>
    </figure>
  );
}
