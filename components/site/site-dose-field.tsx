'use client';

import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'motion/react';

/**
 * The hero ground: a live isodose field.
 *
 * Not decoration — this is the shape of what CureRays does. A source emits, and
 * dose falls away from it in contours that crowd near the target and thin out
 * with distance. The pointer re-aims the source; the field redistributes.
 *
 * Drawn as sampled closed contours rather than a per-pixel field: ~14 rings of
 * 72 points is a few hundred operations a frame, where shading a 1440x800 field
 * pixel by pixel would be over a million. It reads the same and costs nothing.
 *
 * Colours are read from the CSS custom properties at runtime, so the field can
 * never drift from the brand tokens — the same approach the login canvas uses.
 */

const RINGS = 14;
const POINTS = 72;
const TWO_PI = Math.PI * 2;

/** Smooth, seamless angular perturbation. Sines of integer multiples of theta
 *  close on themselves, so the contour never shows a seam. */
function wobble(theta: number, time: number) {
  return (
    0.055 * Math.sin(3 * theta + time * 0.31) +
    0.038 * Math.sin(5 * theta - time * 0.23) +
    0.024 * Math.sin(7 * theta + time * 0.17)
  );
}

export function DoseField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const styles = window.getComputedStyle(canvas);
    const readToken = (token: string) => styles.getPropertyValue(token).trim();
    const hot = readToken('--site-brand-lit') || styles.color;
    const cool = readToken('--site-brand') || styles.color;

    // The source stays in the right half so it never sits behind the headline.
    const target = { x: 0.68, y: 0.44 };
    const source = { x: target.x, y: target.y };

    let width = 0;
    let height = 0;
    let frame = 0;
    let running = !reduced;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const draw = (time: number) => {
      if (!width || !height) return;
      ctx.clearRect(0, 0, width, height);

      // Ease toward the pointer target rather than snapping to it.
      source.x += (target.x - source.x) * 0.045;
      source.y += (target.y - source.y) * 0.045;

      const cx = source.x * width;
      const cy = source.y * height;
      const reach = Math.hypot(width, height) * 0.78;

      // The beam that causes the deposit. Without it the contours read as
      // ripples on water; with it they read as dose landing where it was aimed.
      const emitterX = cx + width * 0.42;
      const emitterY = cy - height * 0.86;
      const spread = reach * 0.17;
      const along = Math.atan2(cy - emitterY, cx - emitterX);
      const across = along + Math.PI / 2;

      ctx.fillStyle = hot;
      for (let pass = 0; pass < 3; pass += 1) {
        const flare = spread * (0.45 + pass * 0.42);
        ctx.globalAlpha = 0.05 - pass * 0.012;
        ctx.beginPath();
        ctx.moveTo(emitterX, emitterY);
        ctx.lineTo(cx + Math.cos(across) * flare, cy + Math.sin(across) * flare);
        ctx.lineTo(cx - Math.cos(across) * flare, cy - Math.sin(across) * flare);
        ctx.closePath();
        ctx.fill();
      }

      // Core: the target volume taking the dose.
      for (let i = 9; i > 0; i -= 1) {
        ctx.globalAlpha = 0.05;
        ctx.beginPath();
        ctx.arc(cx, cy, reach * 0.055 * i, 0, TWO_PI);
        ctx.fill();
      }

      // Isodose contours. Radii follow a power curve so bands crowd near the
      // target and open out as dose falls away.
      for (let ring = 0; ring < RINGS; ring += 1) {
        const level = (ring + 1) / RINGS;
        const radius = reach * Math.pow(level, 1.4);
        const fade = 1 - level;

        ctx.beginPath();
        for (let point = 0; point <= POINTS; point += 1) {
          const theta = (point / POINTS) * TWO_PI;
          const r = radius * (1 + wobble(theta, time + ring * 0.6) * (0.3 + level * 0.8));
          const x = cx + Math.cos(theta) * r;
          // Slight compression along the beam axis, as a real deposit elongates.
          const y = cy + Math.sin(theta) * r * 0.86;
          if (point === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();

        ctx.strokeStyle = level < 0.4 ? hot : cool;
        ctx.globalAlpha = 0.16 + fade * 0.62;
        ctx.lineWidth = 0.7 + fade * 2.4;
        ctx.stroke();
      }

      ctx.globalAlpha = 1;
    };

    const loop = () => {
      if (!running) return;
      draw(performance.now() / 1000);
      frame = window.requestAnimationFrame(loop);
    };

    const onPointer = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      target.x = Math.min(0.92, Math.max(0.5, x));
      target.y = Math.min(0.8, Math.max(0.18, y));
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Stop burning frames once the hero has scrolled away.
        const shouldRun = entry.isIntersecting && !reduced;
        if (shouldRun && !running) {
          running = true;
          loop();
        } else if (!shouldRun) {
          running = false;
          window.cancelAnimationFrame(frame);
        }
      },
      { threshold: 0 }
    );

    const resizeObserver = new ResizeObserver(() => {
      resize();
      if (reduced) draw(0);
    });

    resize();
    resizeObserver.observe(canvas);
    observer.observe(canvas);

    if (reduced) {
      draw(0);
    } else {
      window.addEventListener('pointermove', onPointer, { passive: true });
      loop();
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
