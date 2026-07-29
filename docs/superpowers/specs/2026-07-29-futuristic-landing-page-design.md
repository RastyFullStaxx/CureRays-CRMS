# Futuristic Pilot Landing Page Design

## Goal

Create a distinctive public landing and demo sign-in experience for CureRays CRMS. The page should make the product feel advanced and clinically precise while remaining calm, accessible, and truthful about the current synthetic-data pilot.

## Approved Direction

The visual direction is **Orbital Course Map**: a clinical-night surface with a restrained radiotherapy orbit, luminous course geometry, glass depth, and a four-stage patient-course path. The futuristic character comes from spatial composition and motion, not oversized typography or decorative complexity.

The first viewport must keep both the product proposition and sign-in form visible on common desktop and laptop displays.

## Audience and Message

The page is for CureRays clinical and operations staff evaluating the pilot. It is not patient-facing and is not a public sales lead funnel.

Primary message:

> One Course. Every Next Action in View.

Supporting message:

> Coordinate preparation, treatment, records, and clinic documents from one patient-centered workspace.

The marketing story follows the real product:

1. Keep the patient course at the center.
2. See the next action, owner, and blocker.
3. Complete structured preparation and treatment work.
4. Generate and download clinic-layout DOCX and XLSX outputs.

## Page Structure

### Top Bar

- Existing CureRays logo.
- Product label: Clinical Workflow System.
- Neutral pilot marker: Synthetic Data Pilot.
- No public navigation menu, pricing, contact funnel, or duplicate sign-in CTA.

### Hero

- Course-first headline and concise supporting copy.
- Existing Three.js radiotherapy orbit reused as the signature visual.
- Four connected course stages: Overview, Prepare, Treatment, and Record & Closeout.
- Login card remains visible beside the story.
- Motion is slow and atmospheric, with no scroll listener or pointer-following effect.

### Product Proof

A compact sequence explains the implemented pilot loop:

1. Fill a structured form.
2. Save a durable draft.
3. Generate the clinic document.
4. Download DOCX or XLSX.

This is followed by a course-centered explanation of the four workspace stages and a concise operational benefit band for next action, owner, blocker, and document readiness.

### Pilot Boundary

The page clearly states:

- Synthetic or de-identified data only.
- Pilot demo access, not production authentication.
- Prototype clinical calculations are not clinical guidance.

The page must not claim HIPAA compliance, production readiness, proven safety or speed improvements, identity-bound authorization, MFA, eCW integration, or Drive integration.

### Footer

- CureRays Radiation Medicine.
- Clinical Workflow System.
- Synthetic-data pilot notice.

## Demo Sign-In Behavior

The form remains a client leaf component and uses the existing shared `Button` and `Input` primitives.

- Email uses native `type="email"` validation and is required.
- Password is required with a small native minimum length.
- Password visibility toggle remains keyboard accessible and labeled.
- Submit routes directly to `/dashboard`.
- Copy explicitly identifies the interaction as demo access.
- No credential values are logged, persisted, or sent to an API.
- The inert forgot-password action and unsupported secure-access claim are removed.

The page does not create a session, user identity, role, or authorization claim. Real named-user authentication remains outside this visual task.

## Routing and Architecture

- `/login` remains the canonical landing implementation.
- `/` redirects to `/login` instead of `/dashboard`.
- `AppShell` already excludes both routes from authenticated application chrome.
- `app/login/page.tsx` owns static page composition.
- `components/landing/login-card.tsx` owns only interactive form behavior.
- The existing radiotherapy orbit loader and canvas are reused.
- Landing styling stays in the global token-driven landing section of `app/globals.css`.
- No new dependency, data service, auth service, or speculative component abstraction is added.

## Visual System

- Use Inter and the existing 18/14/13/12 type roles without local size exceptions.
- Lock the landing surface to the existing dark token set for a consistent clinical-night theme.
- Use primary blue for interaction and non-valenced visual energy.
- Use orange only in CureRays brand artwork and a restrained orbit accent.
- Use existing 8px radii, glass, shadow, border, focus, and scrollbar tokens.
- Avoid ad hoc status colors, oversized pills, hardcoded component colors, and mixed page themes.
- Keep content desktop-first while ensuring the existing narrow-layout fallback remains coherent.

## Accessibility and Resilience

- Preserve semantic landmarks, heading order, form labels, and keyboard operation.
- Maintain visible focus states and sufficient input, placeholder, and button contrast.
- Keep the form usable if WebGL is unavailable.
- Reuse the current canvas fallback.
- Respect `prefers-reduced-motion` and `prefers-reduced-transparency`.
- Do not encode or display real PHI.

## Verification

Run the proportional development gate:

```bash
npm run verify
```

Then inspect the landing page with mock data only at representative desktop and laptop sizes. Confirm:

- The first viewport contains the proposition and complete sign-in form.
- `/` lands on `/login`.
- Empty or malformed form values do not navigate.
- Valid demo values navigate to `/dashboard`.
- No missing logo asset is requested.
- Reduced-motion and WebGL fallback behavior remain usable.

No production build, full guardrail suite, or broad browser matrix is required for this active-development UI change.
