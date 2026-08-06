/**
 * The treatments figure: a field of angular marks that reconfigures.
 *
 * One formation per modality. Selecting a modality retargets every mark, and
 * each eases to its new place on a per-mark delay, so the field reorganises as
 * a wave rather than snapping.
 *
 * Each formation **illustrates that modality's own published description**, and
 * nothing beyond it:
 *
 * | Modality  | Published wording                       | Deposit |
 * |-----------|-----------------------------------------|---------|
 * | SRT       | "treat skin cancer at the surface"      | tight, just under the surface |
 * | LDRT      | "very low doses… a short series"        | sparse, spread, in session clusters |
 * | SRT keloid| "follows keloid removal… scars return"  | a thin line on the surface itself |
 * | DEEP-SRT™ | "conditions that sit below the surface" | concentrated well below the surface |
 *
 * The beam above the surface is constant across all four — it is always x-rays
 * from a source — so only the deposit changes, which is exactly what the copy
 * varies.
 *
 * > **This is schematic, and it is a relative statement about delivery.** It
 * > needs the clinic's sign-off before launch. There are deliberately no
 * > numbers, no scale and no falloff curve: those would be clinical data rather
 * > than an illustration of published copy. Do not add them.
 *
 * Every mark is a straight segment: no arcs anywhere, matching the site.
 */

export type Palette = { hot: string; cool: string };
export type Frame = {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  time: number;
  /** 0..1 progress of the current transition, for the leading-edge highlight. */
  progress: number;
  palette: Palette;
};

type Mark = {
  x: number;
  y: number;
  a: number;
  s: number;
  tx: number;
  ty: number;
  ta: number;
  ts: number;
  /** Per-mark stagger, so the field turns over as a wave. */
  delay: number;
};

export const FORMATION_COUNT = 4;
const MARKS = 260;
/** Marks reserved for the beam. Constant across formations — see the header. */
const BEAM = 52;
/** Where the tissue surface sits, in unit space. The one shared datum. */
export const SURFACE = 0.3;

/** Deterministic per-mark noise — layouts must not shuffle on every retarget. */
function hash(i: number, salt: number) {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

/**
 * Target position, angle and length for mark `i` in formation `f`, in a unit
 * square. Kept pure so a formation can be reasoned about on its own.
 */
function layout(f: number, i: number, n: number) {
  const r1 = hash(i, f + 1);
  const r2 = hash(i, f + 17);
  const r3 = hash(i, f + 43);

  // The beam: rays fanning from a source above the frame down to the surface.
  // Identical in every formation, so the eye reads only the deposit as changing.
  if (i < BEAM) {
    const rays = 13;
    const ray = i % rays;
    const along = Math.floor(i / rays) / Math.ceil(BEAM / rays);
    const landing = 0.22 + (ray / (rays - 1)) * 0.56;
    const t = 0.1 + along * 0.86;
    const sx = 0.5;
    const sy = -0.1;
    return {
      x: sx + (landing - sx) * t,
      y: sy + (SURFACE - sy) * t,
      a: Math.atan2(SURFACE - sy, landing - sx),
      s: 0.03 + r1 * 0.02
    };
  }

  const j = i - BEAM;
  const m = n - BEAM;
  // Sum of three uniforms ≈ normal: a soft cluster rather than a hard edge.
  const bell = (r1 + r2 + r3) / 3 - 0.5;

  switch (f) {
    // SRT — "at the surface": a tight deposit immediately beneath it.
    case 0:
      return {
        x: 0.2 + r1 * 0.6,
        y: SURFACE + 0.015 + Math.abs(bell) * 0.34,
        a: (r2 - 0.5) * 0.3,
        s: 0.05 + r3 * 0.055
      };

    // LDRT — "very low doses… over a short series": sparse and spread, gathered
    // into loose session clusters rather than one concentration.
    case 1: {
      const sessions = 5;
      const session = j % sessions;
      return {
        x: 0.17 + (session / (sessions - 1)) * 0.66 + bell * 0.16,
        y: SURFACE + 0.16 + (r2 - 0.5) * 0.36,
        a: r3 * Math.PI,
        s: 0.018 + r3 * 0.016
      };
    }

    // SRT for keloids — "follows keloid removal": the deposit lies along the
    // surface line itself, where the scar is.
    case 2:
      return {
        x: 0.16 + (j / m) * 0.68 + (r1 - 0.5) * 0.03,
        y: SURFACE + bell * 0.055,
        a: (r2 - 0.5) * 0.16,
        s: 0.045 + r3 * 0.05
      };

    // DEEP-SRT™ — "conditions that sit below the skin surface": the deposit
    // gathers well beneath it, leaving the layer above comparatively clear.
    default:
      return {
        x: 0.26 + r1 * 0.48,
        y: SURFACE + 0.3 + bell * 0.3,
        a: (r2 - 0.5) * 0.5,
        s: 0.04 + r3 * 0.05
      };
  }
}

/**
 * The stage: corner brackets, a faint depth grid, and the surface rule.
 *
 * The surface is the one datum every formation is read against — "at the
 * surface", "below the surface" mean nothing without it — so it is drawn solid
 * while everything else stays faint. Deliberately unlabelled and unscaled.
 */
function drawStage(frame: Frame) {
  const { ctx, width, height, palette } = frame;
  const y = Math.round(height * SURFACE) + 0.5;
  ctx.lineCap = 'butt';
  ctx.strokeStyle = palette.cool;
  ctx.lineWidth = 1;

  // Depth grid below the surface only: above it is air, not tissue.
  ctx.globalAlpha = 0.1;
  ctx.beginPath();
  for (let i = 1; i <= 4; i += 1) {
    const gy = Math.round(y + ((height - y) * i) / 5) + 0.5;
    ctx.moveTo(0, gy);
    ctx.lineTo(width, gy);
  }
  for (let i = 1; i < 4; i += 1) {
    const gx = Math.round((width * i) / 4) + 0.5;
    ctx.moveTo(gx, y);
    ctx.lineTo(gx, height);
  }
  ctx.stroke();

  ctx.globalAlpha = 0.85;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(0, y);
  ctx.lineTo(width, y);
  ctx.stroke();

  const arm = Math.min(width, height) * 0.07;
  ctx.globalAlpha = 0.42;
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (const [cx, cy, sx, sy] of [
    [0, 0, 1, 1],
    [width, 0, -1, 1],
    [0, height, 1, -1],
    [width, height, -1, -1]
  ]) {
    ctx.moveTo(cx + sx * arm, cy);
    ctx.lineTo(cx, cy);
    ctx.lineTo(cx, cy + sy * arm);
  }
  ctx.stroke();
  ctx.globalAlpha = 1;
}

export function createField(formation: number): Mark[] {
  return Array.from({ length: MARKS }, (_, i) => {
    const target = layout(formation, i, MARKS);
    return {
      x: target.x,
      y: target.y,
      a: target.a,
      s: target.s,
      tx: target.x,
      ty: target.y,
      ta: target.a,
      ts: target.s,
      delay: hash(i, 7)
    };
  });
}

export function retarget(field: Mark[], formation: number) {
  for (let i = 0; i < field.length; i += 1) {
    const target = layout(formation, i, field.length);
    field[i].tx = target.x;
    field[i].ty = target.y;
    // Take the shorter way round, or marks unwind through a full turn.
    let da = target.a - field[i].a;
    while (da > Math.PI) da -= Math.PI * 2;
    while (da < -Math.PI) da += Math.PI * 2;
    field[i].ta = field[i].a + da;
    field[i].ts = target.s;
  }
}

export function drawField(field: Mark[], frame: Frame) {
  const { ctx, width, height, time, progress, palette } = frame;
  ctx.clearRect(0, 0, width, height);
  drawStage(frame);
  ctx.lineCap = 'square';

  const scale = Math.min(width, height);

  for (let i = 0; i < field.length; i += 1) {
    const m = field[i];
    // Staggered easing: marks whose delay has passed move faster, so the field
    // turns over in a wave instead of translating as one block.
    const local = Math.max(0, Math.min(1, (progress - m.delay * 0.45) / 0.55));
    const ease = local * local * (3 - 2 * local);
    const k = 0.055 + ease * 0.1;

    m.x += (m.tx - m.x) * k;
    m.y += (m.ty - m.y) * k;
    m.a += (m.ta - m.a) * k;
    m.s += (m.ts - m.s) * k;

    // A slow idle so a settled formation still breathes.
    const drift = Math.sin(time * 0.6 + i * 0.7) * 0.0016;
    const px = (m.x + drift) * width;
    const py = (m.y + drift * 1.4) * height;
    const half = m.s * scale * 0.5;
    const dx = Math.cos(m.a) * half;
    const dy = Math.sin(m.a) * half;

    // Marks still travelling are lit; settled ones sit back.
    const travel = Math.min(1, (Math.abs(m.tx - m.x) + Math.abs(m.ty - m.y)) * 14);
    ctx.strokeStyle = travel > 0.35 ? palette.hot : palette.cool;
    ctx.globalAlpha = 0.46 + travel * 0.44;
    ctx.lineWidth = 1.3 + travel * 1.5;
    ctx.beginPath();
    ctx.moveTo(px - dx, py - dy);
    ctx.lineTo(px + dx, py + dy);
    ctx.stroke();
  }

  ctx.globalAlpha = 1;
}
