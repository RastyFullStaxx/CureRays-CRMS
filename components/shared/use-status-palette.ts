'use client';

import { useEffect, useState } from 'react';

export type StatusPalette = {
  positive: string;
  intermediate: string;
  negative: string;
  neutral: string;
  text: string;
  border: string;
  card: string;
};

export type PaletteTone = 'positive' | 'intermediate' | 'negative' | 'neutral';

const defaultPalette: StatusPalette = {
  positive: 'CanvasText',
  intermediate: 'CanvasText',
  negative: 'CanvasText',
  neutral: 'GrayText',
  text: 'CanvasText',
  border: 'GrayText',
  card: 'Canvas',
};

function cssVar(name: string, fallback: string) {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
}

function readStatusPalette(): StatusPalette {
  return {
    positive: cssVar('--status-positive-solid', defaultPalette.positive),
    intermediate: cssVar('--status-intermediate-solid', defaultPalette.intermediate),
    negative: cssVar('--status-negative-solid', defaultPalette.negative),
    neutral: cssVar('--status-neutral-solid', defaultPalette.neutral),
    text: cssVar('--color-text', defaultPalette.text),
    border: cssVar('--color-border', defaultPalette.border),
    card: cssVar('--color-card', defaultPalette.card),
  };
}

export function toneColor(tone: PaletteTone, palette: StatusPalette) {
  if (tone === 'negative') return palette.negative;
  if (tone === 'intermediate') return palette.intermediate;
  if (tone === 'positive') return palette.positive;
  return palette.neutral;
}

export function useStatusPalette() {
  const [palette, setPalette] = useState<StatusPalette>(defaultPalette);

  useEffect(() => {
    const update = () => setPalette(readStatusPalette());
    update();

    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    window.addEventListener('storage', update);

    return () => {
      observer.disconnect();
      window.removeEventListener('storage', update);
    };
  }, []);

  return palette;
}
