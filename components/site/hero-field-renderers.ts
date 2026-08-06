/**
 * The hero field: a vascular bed grown by space colonisation.
 *
 * Attractors pull the nearest node toward them and are consumed on arrival, so
 * the network fills space the way a real vascular bed does rather than
 * following a scripted path.
 *
 * Two settings own its character. Roots are **scattered across the field with
 * random headings** — seeding them along an edge makes every branch fan out of
 * one corner. Attractors are **sparse and spread over the whole field**, with a
 * long reach and a generous kill radius; raising their count and shortening the
 * reach turns the sweeping web into something leaf-like. The bed grows across
 * the reading column freely; the veil is what keeps the copy legible.
 *
 * Every stroke is fully opaque, its colour pre-mixed toward the page ground to
 * carry the fade. Translucent strokes bead at the joins — short segments
 * overlap at every branch point and each overlap darkens.
 *
 * It cycles `growing → holding → dissolving → reseed`. Growth stops at a hard
 * segment limit, the bed is held under a slow perfusion wave, then dissolves
 * under a ramped wash and a fresh one seeds. An earlier version had no limit
 * and kept regrowing over its own canvas; within a minute it was a tangle.
 *
 * Nodes live in a coarse spatial grid keyed on the attractor reach, so each
 * attractor tests a 3x3 neighbourhood instead of every node. Without it the
 * nearest-node search is O(attractors x nodes) and the first paint drops frames.
 */

export type Palette = { hot: string; cool: string; bone: string };
export type Frame = {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  time: number;
  pointer: { x: number; y: number };
  palette: Palette;
};

type Rgb = [number, number, number];
type Node = { x: number; y: number; dx: number; dy: number; depth: number };
type Segment = { x1: number; y1: number; x2: number; y2: number; depth: number; width: number };

/** grow -> hold -> dissolve -> reseed. */
type Phase = 'growing' | 'holding' | 'dissolving';

type Bed = {
  nodes: Node[];
  attractors: { x: number; y: number }[];
  segments: Segment[];
  /** Node indices per grid cell, keyed `row * cols + col`. */
  grid: Map<number, number[]>;
  cols: number;
  rows: number;
  maxDepth: number;
  phase: Phase;
  /** Frame time the current phase began, for the hold and dissolve clocks. */
  phaseAt: number;
  base: HTMLCanvasElement | null;
};

const SEGMENT_LIMIT = 3200;
const REACH = 190;
const KILL = 16;
const STEP = 7;
const DEPTH_CAP = 200;
const TRUNK = 3.6;
/** Growth passes per frame — the bed should fill in seconds, not half a minute. */
const PASSES = 2;
const HOLD_SECONDS = 15;
const DISSOLVE_SECONDS = 3.2;

let bed: Bed | null = null;
let mixed: { key: string; base: string[]; hot: string[] } | null = null;

/* --- colour ------------------------------------------------------------- */

function parse(color: string): Rgb {
  const value = color.trim();
  if (value.startsWith('#')) {
    const body = value.slice(1);
    const full =
      body.length === 3
        ? body
            .split('')
            .map((c) => c + c)
            .join('')
        : body;
    return [
      Number.parseInt(full.slice(0, 2), 16),
      Number.parseInt(full.slice(2, 4), 16),
      Number.parseInt(full.slice(4, 6), 16)
    ];
  }
  const nums = value.match(/[\d.]+/g);
  if (!nums || nums.length < 3) return [0, 0, 0];
  return [Number(nums[0]), Number(nums[1]), Number(nums[2])];
}

function lerp(a: Rgb, b: Rgb, t: number): Rgb {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

const css = (c: Rgb) => `rgb(${Math.round(c[0])} ${Math.round(c[1])} ${Math.round(c[2])})`;

const BANDS = 24;

/**
 * Pre-mix one opaque colour per depth band, for the bed and for the perfusion
 * wave. Recomputed only when the tokens themselves change.
 */
function ramp(palette: Palette) {
  const key = `${palette.cool}|${palette.hot}|${palette.bone}`;
  if (mixed?.key === key) return mixed;
  const cool = parse(palette.cool);
  const hot = parse(palette.hot);
  const bone = parse(palette.bone);
  const base: string[] = [];
  const lit: string[] = [];
  for (let i = 0; i < BANDS; i += 1) {
    const t = i / (BANDS - 1);
    base.push(css(lerp(lerp(cool, hot, t * 0.85), bone, 0.24 + t * 0.42)));
    lit.push(css(lerp(lerp(cool, hot, t * 0.5), bone, 0.02)));
  }
  mixed = { key, base, hot: lit };
  return mixed;
}

/* --- growth ------------------------------------------------------------- */

/** One reach of margin above the frame, so seeds just outside it still bucket. */
const ORIGIN_Y = -REACH;

function cellOf(state: Bed, x: number, y: number) {
  const col = Math.min(state.cols - 1, Math.max(0, Math.floor(x / REACH)));
  const row = Math.min(state.rows - 1, Math.max(0, Math.floor((y - ORIGIN_Y) / REACH)));
  return { col, row };
}

function addNode(state: Bed, node: Node) {
  const index = state.nodes.push(node) - 1;
  const { col, row } = cellOf(state, node.x, node.y);
  const key = row * state.cols + col;
  const cell = state.grid.get(key);
  if (cell) cell.push(index);
  else state.grid.set(key, [index]);
}

function seedBed(width: number, height: number): Bed {
  const state: Bed = {
    nodes: [],
    attractors: [],
    segments: [],
    grid: new Map(),
    cols: Math.ceil((width + REACH * 2) / REACH),
    rows: Math.ceil((height + REACH * 2) / REACH),
    maxDepth: 1,
    phase: 'growing',
    phaseAt: 0,
    base: null
  };

  for (let i = 0; i < 5; i += 1) {
    const angle = Math.random() * Math.PI * 2;
    addNode(state, {
      x: width * (0.22 + Math.random() * 0.74),
      y: height * (0.08 + Math.random() * 0.84),
      dx: Math.cos(angle),
      dy: Math.sin(angle),
      depth: 0
    });
  }

  for (let i = 0; i < 900; i += 1) {
    state.attractors.push({ x: Math.random() * width, y: Math.random() * height });
  }

  return state;
}

function nearestNode(state: Bed, x: number, y: number) {
  const { col, row } = cellOf(state, x, y);
  let best = -1;
  let bestDist = REACH;
  for (let r = row - 1; r <= row + 1; r += 1) {
    if (r < 0 || r >= state.rows) continue;
    for (let c = col - 1; c <= col + 1; c += 1) {
      if (c < 0 || c >= state.cols) continue;
      const cell = state.grid.get(r * state.cols + c);
      if (!cell) continue;
      for (const index of cell) {
        const node = state.nodes[index];
        const d = Math.hypot(node.x - x, node.y - y);
        if (d < bestDist) {
          bestDist = d;
          best = index;
        }
      }
    }
  }
  return { best, bestDist };
}

/** Returns true once there is nothing left to add. The caller owns the phase. */
function grow(state: Bed) {
  const pull = new Map<number, { x: number; y: number; n: number }>();

  for (let a = state.attractors.length - 1; a >= 0; a -= 1) {
    const at = state.attractors[a];
    const { best, bestDist } = nearestNode(state, at.x, at.y);
    if (best === -1) continue;
    if (bestDist < KILL) {
      state.attractors.splice(a, 1);
      continue;
    }
    const node = state.nodes[best];
    const entry = pull.get(best) ?? { x: 0, y: 0, n: 0 };
    entry.x += (at.x - node.x) / bestDist;
    entry.y += (at.y - node.y) / bestDist;
    entry.n += 1;
    pull.set(best, entry);
  }

  for (const [index, dir] of pull) {
    if (state.segments.length >= SEGMENT_LIMIT) break;
    const node = state.nodes[index];
    if (node.depth > DEPTH_CAP) continue;
    // Blend the pull with the node's own heading so branches hold their line
    // instead of kinking toward every nearby attractor.
    const mx = dir.x / dir.n + node.dx * 0.6;
    const my = dir.y / dir.n + node.dy * 0.6;
    const len = Math.hypot(mx, my) || 1;
    const ux = mx / len;
    const uy = my / len;
    const child: Node = {
      x: node.x + ux * STEP,
      y: node.y + uy * STEP,
      dx: ux,
      dy: uy,
      depth: node.depth + 1
    };
    addNode(state, child);
    state.maxDepth = Math.max(state.maxDepth, child.depth);
    state.segments.push({
      x1: node.x,
      y1: node.y,
      x2: child.x,
      y2: child.y,
      depth: child.depth,
      // Thick at the trunk, tapering to capillaries.
      width: Math.max(0.5, TRUNK - child.depth * (TRUNK / DEPTH_CAP))
    });
  }

  return state.segments.length >= SEGMENT_LIMIT || state.attractors.length === 0;
}

/* --- paint -------------------------------------------------------------- */

function band(state: Bed, seg: Segment) {
  return Math.min(BANDS - 1, Math.round((seg.depth / state.maxDepth) * (BANDS - 1)));
}

function stroke(ctx: CanvasRenderingContext2D, seg: Segment, color: string, width: number) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(seg.x1, seg.y1);
  ctx.lineTo(seg.x2, seg.y2);
  ctx.stroke();
}

/** Bake the finished bed once so the holding frame is a blit, not 3200 strokes. */
function bakeBase(state: Bed, frame: Frame) {
  const { width, height, palette } = frame;
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(width * ratio);
  canvas.height = Math.round(height * ratio);
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  ctx.lineCap = 'round';
  const colors = ramp(palette);
  for (const seg of state.segments) stroke(ctx, seg, colors.base[band(state, seg)], seg.width);
  state.base = canvas;
}

export function drawVesselField(frame: Frame) {
  const { ctx, width, height, time, pointer, palette } = frame;
  if (!bed) bed = seedBed(width, height);
  const state = bed;
  const colors = ramp(palette);
  ctx.lineCap = 'round';

  if (state.phase === 'growing') {
    // Strokes accumulate un-washed, so what appears during growth is exactly
    // what the baked bed looks like when it settles.
    let done = false;
    for (let pass = 0; pass < PASSES && !done; pass += 1) {
      const before = state.segments.length;
      done = grow(state);
      for (let i = before; i < state.segments.length; i += 1) {
        const seg = state.segments[i];
        stroke(ctx, seg, colors.base[band(state, seg)], seg.width);
      }
    }
    if (done) {
      state.phase = 'holding';
      state.phaseAt = time;
      bakeBase(state, frame);
    }
    return;
  }

  if (state.phase === 'dissolving') {
    // A ramped bone wash over the live canvas. Clearing outright reads as a
    // glitch; washing out reads as an exhale.
    const p = Math.min(1, (time - state.phaseAt) / DISSOLVE_SECONDS);
    ctx.globalAlpha = 0.014 + p * p * 0.13;
    ctx.fillStyle = palette.bone;
    ctx.fillRect(0, 0, width, height);
    ctx.globalAlpha = 1;
    if (p >= 1) {
      ctx.clearRect(0, 0, width, height);
      bed = null;
    }
    return;
  }

  if (!state.base) bakeBase(state, frame);

  if (time - state.phaseAt > HOLD_SECONDS) {
    state.phase = 'dissolving';
    state.phaseAt = time;
    return;
  }

  // Holding: the static bed, plus one slow perfusion wave running trunk to
  // capillary with a quiet gap between sweeps, and a soft highlight under the
  // pointer. No new geometry.
  ctx.clearRect(0, 0, width, height);
  if (state.base) ctx.drawImage(state.base, 0, 0, width, height);

  const head = ((time * 0.12) % 1.5) - 0.15;
  const px = pointer.x * width;
  const py = pointer.y * height;

  for (const seg of state.segments) {
    const t = seg.depth / state.maxDepth;
    const wave = 1 - Math.min(1, Math.abs(t - head) / 0.15);
    const near = 1 - Math.min(1, Math.hypot(seg.x2 - px, seg.y2 - py) / 260);
    const lift = Math.max(wave, near * 0.68);
    if (lift <= 0.03) continue;
    const i = band(state, seg);
    stroke(ctx, seg, lift > 0.55 ? colors.hot[i] : colors.base[i], seg.width * (1 + lift * 0.9));
  }
}

/**
 * True once the bed has finished growing. The reduced-motion path uses it to
 * warm up a static render and stops there — no hold clock, no dissolve, because
 * a repeating loop is precisely what that preference is asking not to see.
 */
export function bedHasGrown() {
  return bed ? bed.phase !== 'growing' : false;
}

export function resetFieldState() {
  bed = null;
}
