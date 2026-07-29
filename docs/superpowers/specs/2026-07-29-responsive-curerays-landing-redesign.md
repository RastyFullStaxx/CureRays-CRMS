# Responsive CureRays Landing Redesign

## Goal

Replace the forced clinical-night landing with a fixed, light-first CureRays brand experience that remains polished from mobile phones through large desktop displays while keeping the complete demo sign-in easy to reach.

## Approved Direction

The visual direction is **Daylight Precision**: a luminous clinical canvas, deep CureRays blue interaction, restrained orange brand energy, radiotherapy-inspired orbital geometry, and disciplined white space. The page uses one fixed palette independent of the authenticated application theme.

Inter remains the only typeface because it is the required CureRays UI font. Distinction comes from composition, hierarchy, weight, and spacing rather than adding a second font family.

## Audience and Positioning

The page is for CureRays clinical and operations staff evaluating CRMS. It introduces both CureRays Radiation Medicine and the course-centered workflow system without claiming production readiness, clinical efficacy, facility capabilities, awards, integrations, or regulatory status.

Primary message:

> Radiation Medicine, Orchestrated Around Every Course.

Supporting message:

> CureRays brings preparation, treatment, records, and clinic documents into one coordinated operational view.

## Page Structure

### Header

- Correctly scaled CureRays mark with a text wordmark and the product label.
- Compact anchor navigation for About CureRays, The Course, and Sign In.
- No theme toggle because the landing palette is intentionally fixed.
- Mobile layouts keep the brand and sign-in link visible while allowing secondary anchors to collapse.

### Hero

- Balanced two-column composition on desktop and laptop screens.
- Complete proposition, patient-course path, and sign-in card visible at 1280 by 800.
- Single-column flow below the tablet breakpoint.
- Existing Three.js radiotherapy orbit remains the signature visual but is contained within the hero composition instead of creating a large empty background field.
- The square logo asset renders as a square mark rather than being stretched as a landscape logo.

### CureRays Story

- A dedicated About CureRays section explains the operational purpose of CRMS in radiation medicine.
- One generated editorial image uses abstract treatment geometry with no people, identifiers, facility claims, text, or logos.
- Supporting points cover course context, coordinated handoffs, and document continuity.

### Course and Product Proof

- The four product workspaces remain Overview, Prepare, Treatment, and Record & Closeout.
- A compact workflow sequence remains Fill, Save, Generate, and Download.
- Operational benefits remain grounded in next action, owner, blocker, and document readiness.

### Demo Boundary

- Remove every visible occurrence of “Synthetic Data Pilot” and “Synthetic data.”
- Use “Demo Access” and “Staff Demo Access” for the entry experience.
- Keep an honest note that demo access does not verify identity.
- Tell staff to use sample or de-identified data only.
- Preserve native email validation, password minimum length, keyboard-accessible visibility control, and direct dashboard entry.

### Footer

- CureRays Radiation Medicine.
- Clinical Workflow System.
- A concise demo-environment label without the removed wording.

## Fixed Color System

The global stylesheet defines immutable landing semantic tokens for:

- daylight background;
- white and quiet-blue surfaces;
- CureRays blue and its strong interaction state;
- CureRays orange for brand artwork only;
- dark navy text;
- muted slate text;
- pale blue-gray borders.

The landing uses these tokens regardless of whether `html.dark` is present. No hardcoded colors appear in React component files.

## Responsive Behavior

- 1280 by 800: full hero proposition and sign-in card are visible without wasted vertical space.
- 1024 to 1279 pixels: the split layout remains compact with reduced gaps.
- 721 to 1023 pixels: hero stacks with sign-in immediately after the proposition.
- 480 to 720 pixels: course and proof grids become two-column or single-column as space permits.
- Below 480 pixels: all content and controls become single-column, touch targets remain at least 40 pixels high, and no horizontal scrolling occurs.
- Wide screens cap content width so typography and form fields do not stretch.

## Motion and Accessibility

- Retain slow ambient orbital motion and subtle entrance transitions.
- Respect `prefers-reduced-motion` and `prefers-reduced-transparency`.
- Preserve semantic landmarks, heading order, labels, native validation, visible focus, and WebGL fallback.
- The generated image uses descriptive alternative text.
- Do not display or transmit real PHI.

## Architecture

- `app/login/page.tsx` owns static marketing composition.
- `components/landing/login-card.tsx` owns only form interaction.
- `components/landing/radiotherapy-orbit-canvas.tsx` continues to own the visual simulation.
- `app/globals.css` owns the fixed landing tokens, layout, motion, and responsive behavior.
- `public/curerays-treatment-geometry.png` stores the generated marketing asset.
- `scripts/product-simplification-guardrails.mjs` protects the fixed palette contract and removed copy.
- No new package, data service, auth service, or generic component abstraction is added.

## Verification

- Run the landing guardrail before implementation and confirm the new assertions fail.
- Run it after implementation and confirm it passes.
- Run `npm.cmd run verify`.
- Inspect `/login` with mock data at 390 by 844, 768 by 1024, 1280 by 800, 1440 by 900, and 1920 by 1080.
- Confirm no horizontal overflow, no cropped logo, no removed copy, a complete form, reduced-motion behavior, and successful demo navigation.
- Do not run a production build or full guardrail suite during active development.
