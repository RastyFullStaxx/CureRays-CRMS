import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const globals = readFileSync(join(root, 'app/globals.css'), 'utf8');

function tokenBlock(selector) {
  const start = globals.indexOf(`${selector} {`);
  assert.notEqual(start, -1, `Missing token block: ${selector}`);
  const end = globals.indexOf('\n}', start);
  const body = globals.slice(start, end);
  const tokens = new Map();
  for (const [, name, value] of body.matchAll(/(--[a-z0-9-]+):\s*(#[0-9a-fA-F]{6})\s*;/g)) {
    tokens.set(name, value);
  }
  return tokens;
}

function channel(value) {
  const srgb = value / 255;
  return srgb <= 0.04045 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4;
}

function luminance(hex) {
  const r = channel(parseInt(hex.slice(1, 3), 16));
  const g = channel(parseInt(hex.slice(3, 5), 16));
  const b = channel(parseInt(hex.slice(5, 7), 16));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a, b) {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
}

const TONES = ['positive', 'intermediate', 'negative', 'neutral'];

/** WCAG 1.4.3 (4.5:1 body text) and 1.4.11 (3:1 non-text marks). */
function pairsFor(theme) {
  const pairs = [
    ['--color-text', '--color-bg', 4.5, 'body text on the page'],
    ['--color-text', '--color-card', 4.5, 'body text on a card'],
    ['--color-text-muted', '--color-bg', 4.5, 'muted text on the page'],
    ['--color-text-muted', '--color-card', 4.5, 'muted text on a card'],
    ['--color-text-soft', '--color-bg', 4.5, 'soft text on the page'],
    ['--color-primary', '--color-bg', 4.5, 'link and interaction text on the page'],
    ['--color-primary', '--color-card', 4.5, 'link and interaction text on a card'],
    ['--color-primary-foreground', '--color-primary', 4.5, 'text on a primary button'],
    ['--color-primary', '--color-bg', 3, 'focus ring against the page'],
    ['--color-primary', '--color-card', 3, 'focus ring against a card'],
  ];

  for (const tone of TONES) {
    pairs.push(
      [`--status-${tone}-text`, `--status-${tone}-surface`, 4.5, `${tone} pill text`],
      [`--status-${tone}-text`, '--color-bg', 4.5, `${tone} text on the page`],
      [`--status-${tone}-border`, `--status-${tone}-surface`, 3, `${tone} pill border`],
      [`--status-${tone}-border`, '--color-bg', 3, `${tone} border against the page`],
      [`--status-${tone}-solid`, '--color-bg', 3, `${tone} solid mark against the page`],
      [`--status-${tone}-solid`, '--color-card', 3, `${tone} solid mark on a card`],
    );
  }

  return pairs.map((pair) => [theme, ...pair]);
}

const themes = [
  [':root', tokenBlock(':root')],
  ['.dark', tokenBlock('.dark')],
];

const failures = [];
let checked = 0;

for (const [selector, tokens] of themes) {
  // .dark only overrides; anything it does not restate is inherited from :root.
  const resolved = selector === '.dark' ? new Map([...themes[0][1], ...tokens]) : tokens;

  for (const [theme, foreground, background, minimum, description] of pairsFor(selector)) {
    const fg = resolved.get(foreground);
    const bg = resolved.get(background);
    assert.ok(fg, `${theme} is missing ${foreground}`);
    assert.ok(bg, `${theme} is missing ${background}`);

    const ratio = contrast(fg, bg);
    checked += 1;
    if (ratio < minimum) {
      failures.push(
        `${theme} ${description}: ${foreground} ${fg} on ${background} ${bg} ` +
          `= ${ratio.toFixed(2)}:1, needs ${minimum}:1`,
      );
    }
  }
}

assert.deepEqual(failures, [], `Contrast failures:\n  ${failures.join('\n  ')}\n`);

// No pure black or pure white anywhere in the brand system.
for (const [selector, tokens] of themes) {
  for (const [name, value] of tokens) {
    const hex = value.toUpperCase();
    assert.ok(
      hex !== '#FFFFFF' && hex !== '#000000',
      `${selector} ${name} uses a true colour (${value}); the brand system is off-black and off-white only`,
    );
  }
}

console.log(`Contrast guardrails passed (${checked} pairs across both themes).`);
