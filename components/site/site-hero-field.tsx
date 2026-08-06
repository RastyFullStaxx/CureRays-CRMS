'use client';

import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'motion/react';
import {
  bedHasGrown,
  drawVesselField,
  resetFieldState,
  type Palette
} from '@/components/site/hero-field-renderers';

/**
 * Canvas host for the hero ground. Owns sizing, the frame loop, pointer easing,
 * the off-screen pause and reduced motion, so the renderer handles none of it.
 */
export function SiteHeroField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const styles = window.getComputedStyle(canvas);
    const token = (name: string) => styles.getPropertyValue(name).trim() || styles.color;
    const palette: Palette = {
      hot: token('--site-brand-lit'),
      cool: token('--site-brand'),
      bone: token('--color-bg')
    };

    // Held in the right half so the bed never competes with the headline.
    const target = { x: 0.72, y: 0.44 };
    const pointer = { x: target.x, y: target.y };

    let width = 0;
    let height = 0;
    let frame = 0;
    let running = false;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      resetFieldState();
    };

    const step = () => {
      if (!running || !width || !height) return;
      pointer.x += (target.x - pointer.x) * 0.045;
      pointer.y += (target.y - pointer.y) * 0.045;
      drawVesselField({ ctx, width, height, time: performance.now() / 1000, pointer, palette });
      frame = window.requestAnimationFrame(step);
    };

    const onPointer = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      target.x = Math.min(0.97, Math.max(0.42, (event.clientX - rect.left) / rect.width));
      target.y = Math.min(0.88, Math.max(0.12, (event.clientY - rect.top) / rect.height));
    };

    // Reduced motion gets the finished bed, just not the growing of it: run
    // frames until it has grown, draw that once, and never schedule another.
    const growStatic = () => {
      if (!width || !height) return;
      for (let i = 0; i < 1200 && !bedHasGrown(); i += 1) {
        drawVesselField({ ctx, width, height, time: 0, pointer, palette });
      }
      drawVesselField({ ctx, width, height, time: 0, pointer, palette });
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Stop burning frames once the hero has scrolled away.
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
      if (reduced) growStatic();
    });

    resize();
    resizeObserver.observe(canvas);
    observer.observe(canvas);

    if (reduced) {
      growStatic();
    } else {
      window.addEventListener('pointermove', onPointer, { passive: true });
      running = true;
      step();
    }

    return () => {
      running = false;
      window.cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', onPointer);
      resizeObserver.disconnect();
      observer.disconnect();
    };
  }, [reduced]);

  return <canvas ref={canvasRef} className="site-dose-field" aria-hidden="true" />;
}
