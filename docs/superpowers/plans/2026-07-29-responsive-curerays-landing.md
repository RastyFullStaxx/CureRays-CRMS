# Responsive CureRays Landing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the approved fixed-palette, fully responsive CureRays landing and demo sign-in experience.

**Architecture:** Keep the server-rendered marketing composition in `app/login/page.tsx`, the interactive form in the existing client leaf, and all visual behavior in the existing landing section of the global stylesheet. Reuse the current Three.js orbit and UI primitives, add one project-local generated image, and extend the existing simplification guardrail instead of adding a test framework.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 3, global CSS tokens, Three.js, Next Image.

## Global Constraints

- Use one fixed Daylight Precision palette independent of `html.dark`.
- Use Inter exclusively and retain the existing 18, 14, 13, and 12 pixel type roles.
- Remove every visible occurrence of “Synthetic Data Pilot” and “Synthetic data.”
- Keep demo access honest and require sample or de-identified data only.
- Keep the full hero proposition and sign-in usable at 1280 by 800.
- Support widths from 390 pixels through 1920 pixels without horizontal overflow.
- Use global CSS tokens for every color and no hardcoded colors in React components.
- Reuse the existing orbit, Button, Input, route behavior, and native form validation.
- Add no dependency and run no production build or full suite.

---

### Task 1: Lock the Landing Contract and Marketing Composition

**Files:**
- Modify: `scripts/product-simplification-guardrails.mjs`
- Modify: `app/login/page.tsx`
- Modify: `components/landing/login-card.tsx`

**Interfaces:**
- Consumes: existing `LoginCard`, `RadiotherapyOrbitCanvasMount`, `Button`, and `Input`
- Produces: semantic `landing-*` markup consumed by Task 2 and source assertions that protect the approved copy and fixed theme

- [ ] **Step 1: Add failing source guardrails**

Add assertions after the existing login-page checks:

```js
const loginCard = read("components/landing/login-card.tsx");

assert.doesNotMatch(loginPage, /className="landing-page dark"/, "Landing must use its fixed daylight palette");
assert.doesNotMatch(loginPage, /Synthetic Data Pilot|Synthetic data/i, "Landing page must not expose removed pilot wording");
assert.doesNotMatch(loginCard, /Synthetic Data Pilot|Synthetic data/i, "Landing sign-in must not expose removed pilot wording");
assert.match(loginPage, /About CureRays/, "Landing must introduce CureRays Radiation Medicine");
assert.match(loginPage, /href="#sign-in"/, "Landing header must provide a direct sign-in anchor");
```

- [ ] **Step 2: Run the guardrail and verify RED**

Run:

```powershell
node scripts/product-simplification-guardrails.mjs
```

Expected: FAIL on the fixed daylight palette assertion because the current page still renders `className="landing-page dark"`.

- [ ] **Step 3: Replace the page composition**

Update `app/login/page.tsx` to:

- remove the forced `dark` class;
- render a correctly sized square logo mark plus CureRays wordmark;
- add About CureRays, The Course, and Sign In anchors;
- use the approved hero message;
- place the orbit inside a dedicated hero visual layer;
- preserve the four course stages;
- add an About CureRays image-and-copy section;
- retain the workflow and operations proof;
- replace the pilot boundary with a Demo Access boundary;
- remove the rejected wording from the footer.

Use `Image` for `/curerays-treatment-geometry.png` with descriptive alternative text and explicit dimensions.

- [ ] **Step 4: Update the demo sign-in copy**

Keep the existing form behavior and native attributes, but use:

```tsx
<p className="landing-login-kicker">Staff Demo Access</p>
<h2>Open CureRays CRMS</h2>
<p className="landing-login-subtitle">
  Enter any valid email and a password of at least six characters.
</p>
```

Use `Open Demo Workspace` for the submit label and:

```tsx
<span>Demo access does not verify identity. Use sample or de-identified data only.</span>
```

for the safety note.

- [ ] **Step 5: Run the source guardrail**

Run:

```powershell
node scripts/product-simplification-guardrails.mjs
```

Expected: the new landing assertions pass; the existing visual assertion may remain pending until Task 2.

### Task 2: Generate the CureRays Editorial Visual and Build the Responsive System

**Files:**
- Create: `public/curerays-treatment-geometry.png`
- Modify: `app/globals.css`
- Verify: `components/landing/radiotherapy-orbit-canvas.tsx`

**Interfaces:**
- Consumes: the `landing-*` class contract from Task 1 and the existing orbit token reader
- Produces: a fixed-token, responsive landing from 390 through 1920 pixels

- [ ] **Step 1: Generate the project visual**

Use the built-in image generation tool with this prompt:

```text
Use case: ads-marketing
Asset type: CureRays landing page editorial image
Primary request: create a refined abstract interpretation of precision radiation medicine using concentric treatment geometry, a sculptural beam field, and calm clinical architecture
Scene/backdrop: luminous white and quiet blue clinical space, no identifiable real facility
Style/medium: premium editorial 3D visualization with realistic materials
Composition/framing: wide landscape, focal geometry slightly right of center, generous calm negative space
Lighting/mood: daylight, precise, hopeful, trustworthy
Color palette: deep clinical blue, white, pale blue-gray, one restrained warm orange light accent
Constraints: no people, no patients, no text, no logos, no medical claims, no identifiable equipment brand, no watermark
Avoid: dark cyberpunk styling, neon overload, gore, anatomy, dashboards, fake UI, clutter
```

Copy the selected generated file into `public/curerays-treatment-geometry.png`.

- [ ] **Step 2: Add immutable landing tokens**

Add fixed landing semantic color tokens to `:root` and do not override them in `.dark`. Use those tokens throughout the landing section so authenticated theme state cannot recolor the page.

- [ ] **Step 3: Replace the landing CSS**

Keep the existing class family but implement:

- a 72 pixel header;
- a compact desktop hero sized for 1280 by 800;
- a contained orbit field behind the hero copy;
- a 400 to 432 pixel sign-in column;
- image-and-copy CureRays story layout;
- two- and four-column proof layouts;
- responsive breakpoints at 1279, 1023, 720, and 479 pixels;
- reduced-motion and reduced-transparency fallbacks;
- focus-visible states and 40 pixel minimum controls.

Keep all typography on the existing role tokens and every color on the new landing tokens.

- [ ] **Step 4: Verify the orbit fixed palette**

Update the orbit palette token names only if required so the canvas reads the immutable landing tokens. Preserve the existing WebGL failure path, resize observer, theme mutation observer safety, reduced-motion behavior, and cleanup.

- [ ] **Step 5: Run targeted checks**

Run:

```powershell
node scripts/product-simplification-guardrails.mjs
npm.cmd run test:typography
npm.cmd run test:colors
```

Expected: all three commands exit 0.

### Task 3: Browser Validation and Development Gate

**Files:**
- Verify: `app/login/page.tsx`
- Verify: `components/landing/login-card.tsx`
- Verify: `app/globals.css`
- Verify: `public/curerays-treatment-geometry.png`

**Interfaces:**
- Consumes: completed landing implementation
- Produces: fresh visual, interaction, accessibility, and code-quality evidence

- [ ] **Step 1: Run the development gate**

Run:

```powershell
npm.cmd run verify
```

Expected: exit 0. Existing repository warnings may remain, but there must be no new errors.

- [ ] **Step 2: Inspect responsive views**

Use the local mock-data dev server to inspect `/login` at:

```text
390 by 844
768 by 1024
1280 by 800
1440 by 900
1920 by 1080
```

Confirm the header, hero, sign-in, story image, course map, demo boundary, and footer remain contained with no horizontal scroll.

- [ ] **Step 3: Verify interactions and accessibility**

Confirm:

- empty and malformed values do not navigate;
- valid demo values navigate to `/dashboard`;
- password visibility works from keyboard;
- focus indicators remain visible;
- reduced motion disables looping animation;
- the page remains fixed to the Daylight Precision palette when `html.dark` is present;
- the removed wording does not appear.

- [ ] **Step 4: Review the final diff**

Run:

```powershell
git diff --check
git diff -- app/login/page.tsx components/landing/login-card.tsx components/landing/radiotherapy-orbit-canvas.tsx app/globals.css scripts/product-simplification-guardrails.mjs
git status --short
```

Confirm only the approved landing, generated image, guardrail, specification, and plan changes are included. Leave unrelated `.claude/settings.local.json` untouched.
