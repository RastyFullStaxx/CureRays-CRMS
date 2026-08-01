# Full-Viewport Landing Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the CureRays landing fill desktop and large-desktop viewports without apparent artwork cropping while preserving bounded, legible content and the existing mobile flow.

**Architecture:** Keep the existing page/component structure and solve the composition in global CSS. Add one route-scoped Next font variable for marketing headings, widen the shared landing frame only on large screens, make the atmospheric layer viewport-wide, and let desktop hero height follow the available viewport.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, global CSS tokens, `next/font/google`, Node assertion guardrails, Playwright browser inspection.

## Global Constraints

- Keep the fixed landing daylight palette unchanged.
- Add no package dependency and no layout JavaScript.
- Preserve authentication, form validation, keyboard behavior, and reduced-motion handling.
- Space Grotesk is landing-only; Inter remains the UI, body, and authenticated-application face.
- Preserve the existing stacked tablet and mobile layouts.
- No horizontal overflow or clipped interactive content at any verified viewport.

---

### Task 1: Lock the Full-Viewport and Typography Contracts

**Files:**
- Modify: `scripts/product-simplification-guardrails.mjs`
- Modify: `scripts/typography-guardrails.mjs`

**Interfaces:**
- Consumes: `app/login/page.tsx` and `app/globals.css` as source text.
- Produces: failing source assertions that define the approved responsive and font behavior.

- [ ] **Step 1: Add failing landing assertions**

Add assertions requiring the route-scoped Space Grotesk variable, the 1920px large-screen frame, viewport-relative hero artwork, and height-aware desktop hero:

```js
assert.match(loginPage, /import \{ Space_Grotesk \} from ['"]next\/font\/google['"]/, 'Landing must load its display face through next/font');
assert.match(loginPage, /landingDisplay\.variable/, 'Landing must scope the display font variable to the route');
assert.match(globals, /@media \(min-width: 1600px\)[\s\S]*?\.landing-page-frame\s*\{[^}]*max-width:\s*1920px;/, 'Large landing viewports must use the 1920px editorial frame');
assert.match(globals, /\.landing-hero-visual\s*\{[^}]*inset-inline-start:\s*calc\(50% - 50vw\);/s, 'Large landing artwork must reach the viewport edge');
assert.match(globals, /\.landing-hero\s*\{[^}]*min-height:\s*clamp\(584px, calc\(100dvh - 72px\), 1120px\);/s, 'Desktop landing hero must follow available viewport height');
```

- [ ] **Step 2: Narrow the typography guardrail exception**

Read `app/login/page.tsx`, require `Space_Grotesk`, and allow exactly one additional global font-family declaration:

```js
const loginPage = read('app/login/page.tsx');
assert.match(loginPage, /Space_Grotesk/, 'Landing must use the approved Space Grotesk display face');
assert.deepEqual(fontFamilyLines.map((line) => line.trim()), [
  'font-family: var(--font-ui);',
  'font-family: var(--font-landing-display), var(--font-ui);',
]);
```

- [ ] **Step 3: Run the targeted checks and confirm RED**

Run:

```powershell
node scripts/product-simplification-guardrails.mjs
npm.cmd run test:typography
```

Expected: both checks fail because the page has no display-font variable and the CSS still uses the 1440px frame and 680px hero ceiling.

---

### Task 2: Implement the Wide Editorial Composition

**Files:**
- Modify: `app/login/page.tsx`
- Modify: `app/globals.css`
- Modify: `docs/design/typography.md`
- Test: `scripts/product-simplification-guardrails.mjs`
- Test: `scripts/typography-guardrails.mjs`

**Interfaces:**
- Consumes: existing `.landing-*` classes, responsive breakpoints, fixed landing palette, and `next/font/google`.
- Produces: `--font-landing-display`, a 1920px large-screen frame, viewport-wide hero atmosphere, bounded wide-screen columns, and a height-aware desktop hero.

- [ ] **Step 1: Add the route-scoped display font**

In `app/login/page.tsx`, add:

```tsx
import { Space_Grotesk } from 'next/font/google';

const landingDisplay = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-landing-display',
  weight: ['600', '700'],
});
```

Apply it without changing component structure:

```tsx
<main className={`landing-page ${landingDisplay.variable}`}>
```

- [ ] **Step 2: Make desktop hero height viewport-aware and remove the container crop**

Change the existing `.landing-hero` rule to:

```css
min-height: clamp(584px, calc(100dvh - 72px), 1120px);
overflow: visible;
```

Keep `.landing-page { overflow-x: hidden; }` as the final horizontal safety boundary.

- [ ] **Step 3: Apply the display face only to marketing headings**

Add one global declaration:

```css
.landing-brand-copy strong,
.landing-title,
.landing-section-heading h2,
.landing-boundary h2 {
  font-family: var(--font-landing-display), var(--font-ui);
}
```

Do not apply it to navigation, form labels, inputs, buttons, workflow details, or body copy.

- [ ] **Step 4: Add the large-screen composition breakpoint**

Add after the existing desktop landing media rules:

```css
@media (min-width: 1600px) {
  .landing-page-frame {
    max-width: 1920px;
    padding-inline: clamp(32px, 3vw, 64px);
  }

  .landing-hero {
    grid-template-columns: minmax(680px, 880px) minmax(420px, 460px);
    justify-content: space-between;
  }

  .landing-hero-visual {
    inset-inline-end: 28%;
    inset-inline-start: calc(50% - 50vw);
  }

  .landing-orbit-canvas {
    height: 100%;
    inset: 0 auto auto 0;
    width: min(72vw, 1280px);
  }

  .landing-copy {
    max-width: 880px;
  }

  .landing-card-wrap {
    max-width: 460px;
  }

  .landing-about {
    grid-template-columns: minmax(0, 1.15fr) minmax(420px, 0.85fr);
  }

  .landing-about-image {
    height: clamp(520px, 32vw, 640px);
  }

  .landing-about-copy {
    max-width: 640px;
  }
}
```

- [ ] **Step 5: Update the editorial image hint**

Use:

```tsx
sizes="(max-width: 1023px) calc(100vw - 32px), (max-width: 1599px) 48vw, (max-width: 2559px) 50vw, 960px"
```

- [ ] **Step 6: Record the landing-only typography exception**

Add to `docs/design/typography.md`:

```markdown
## Landing Display Exception

The public landing may use Space Grotesk 600/700 through the route-scoped `--font-landing-display` variable for the CureRays wordmark and marketing headings only. Navigation, workflow labels, body copy, forms, controls, and every authenticated surface remain Inter.
```

- [ ] **Step 7: Run targeted checks and confirm GREEN**

Run:

```powershell
node scripts/product-simplification-guardrails.mjs
npm.cmd run test:typography
npm.cmd run test:colors
```

Expected: all pass.

---

### Task 3: Verify the Rendered Responsive Behavior

**Files:**
- Verify: `app/login/page.tsx`
- Verify: `app/globals.css`
- Verify: `components/landing/login-card.tsx`

**Interfaces:**
- Consumes: the live `/login` page and the existing demo authentication endpoint.
- Produces: measured viewport evidence that the approved composition works without regressions.

- [ ] **Step 1: Restart the development server**

Restart the existing Next development server after the CSS/font batch and load `http://127.0.0.1:3000/login` with mock data only.

- [ ] **Step 2: Check the viewport matrix**

Measure document width, frame width, hero height, copy/card bounds, and horizontal overflow at:

```text
390x844, 768x1024, 1280x800, 1440x900, 1903x886,
1920x1080, 2560x1440, 3440x1440, 3840x2160
```

Expected: `scrollWidth === clientWidth`; copy and form controls remain within the viewport; at 1903x886 the frame uses nearly the full browser width and the hero ends at the viewport fold.

- [ ] **Step 3: Recheck interactions and accessibility**

Verify keyboard focus, password visibility, reduced motion, and a valid demo sign-in to `/dashboard`.

- [ ] **Step 4: Run the project gate**

Run:

```powershell
npm.cmd run verify
git diff --check
```

Expected: verification passes with zero errors; existing baseline warnings may remain.

- [ ] **Step 5: Commit the implementation**

```powershell
git add -- app/login/page.tsx app/globals.css docs/design/typography.md scripts/product-simplification-guardrails.mjs scripts/typography-guardrails.mjs
git commit -m "fix: fill large landing viewports"
```

