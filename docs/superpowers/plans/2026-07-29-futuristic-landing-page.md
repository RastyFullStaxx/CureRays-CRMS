# Futuristic Pilot Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a futuristic, course-centered public landing page with an honest pilot/demo sign-in that enters the dashboard.

**Architecture:** Keep `/login` as the canonical server-rendered page, redirect `/` to it, and keep all interaction inside the existing `LoginCard` client leaf. Reuse the existing Three.js orbit, shared form primitives, global tokens, and AppShell route exclusions; no new component layer, auth service, or dependency is needed.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 3, global CSS tokens, Three.js, Lucide React.

## Global Constraints

- Use Inter and the existing 18/14/13/12 type roles without local size exceptions.
- Use only CSS custom properties from `app/globals.css`; do not hardcode component colors.
- Use primary blue for interaction and orange only for brand artwork.
- Keep the page desktop and laptop focused.
- Preserve semantic landmarks, labels, keyboard operation, visible focus, reduced motion, reduced transparency, and the WebGL fallback.
- Use synthetic or de-identified data only and make no HIPAA, production-readiness, or real-authentication claim.
- The demo form must not log, persist, or submit credentials to an API.
- Add no dependency, auth service, speculative abstraction, or formal test framework.
- Preserve unrelated working-tree changes.

---

### Task 1: Public Route, Marketing Composition, and Honest Demo Form

**Files:**
- Modify: `app/page.tsx`
- Modify: `app/login/page.tsx`
- Modify: `components/landing/login-card.tsx`

**Interfaces:**
- Consumes: `LoginCard`, `RadiotherapyOrbitCanvasMount`, shared `Button`, shared `Input`, `router.push('/dashboard')`
- Produces: static landing markup using the `landing-*` class contract consumed by Task 2

- [ ] **Step 1: Capture the current source-level failures**

Run:

```powershell
rg -n "System_Logo_Landscape|redirect\\('/dashboard'\\)|Forgot password|Secure access" app/page.tsx app/login/page.tsx components/landing/login-card.tsx
```

Expected: matches for the missing PNG, root-to-dashboard redirect, inert password reset, and unsupported secure-access claim.

- [ ] **Step 2: Route `/` to the canonical landing page**

Replace `app/page.tsx` with:

```tsx
import { redirect } from 'next/navigation';

export default function RootPage() {
  redirect('/login');
}
```

- [ ] **Step 3: Replace the login page with the approved course-first composition**

Use `public/System_Logo.svg`, which exists, and keep icons out of the page component. The page structure must be:

```tsx
import Image from 'next/image';
import { LoginCard } from '@/components/landing/login-card';
import { RadiotherapyOrbitCanvasMount } from '@/components/landing/radiotherapy-orbit-canvas-loader';

const courseStages = [
  { name: 'Overview', detail: 'Course gate and next action' },
  { name: 'Prepare', detail: 'Structured clinical work' },
  { name: 'Treatment', detail: 'Fractions and approvals' },
  { name: 'Record & Closeout', detail: 'Documents and completion' },
] as const;

const pilotLoop = [
  { label: 'Fill', detail: 'Complete the structured form' },
  { label: 'Save', detail: 'Resume a durable draft' },
  { label: 'Generate', detail: 'Create the clinic document' },
  { label: 'Download', detail: 'Export DOCX or XLSX' },
] as const;

export default function LoginPage() {
  return (
    <main className="landing-page dark">
      <span className="landing-ambient" aria-hidden="true" />
      <RadiotherapyOrbitCanvasMount />

      <div className="landing-page-frame">
        <header className="landing-topbar">
          <div className="landing-brand">
            <Image
              src="/System_Logo.svg"
              alt="CureRays"
              width={144}
              height={48}
              priority
              className="landing-logo"
            />
            <span>Clinical Workflow System</span>
          </div>
          <span className="landing-pilot-marker">Synthetic Data Pilot</span>
        </header>

        <section className="landing-hero" aria-labelledby="landing-title">
          <div className="landing-copy">
            <div className="landing-copy-block">
              <p className="landing-kicker">Patient-Course Operations</p>
              <h1 id="landing-title" className="landing-title">
                One Course. Every Next Action in View.
              </h1>
              <p className="landing-description">
                Coordinate preparation, treatment, records, and clinic documents from one patient-centered workspace.
              </p>
            </div>

            <ol className="landing-course-map" aria-label="Patient course workspaces">
              {courseStages.map((stage, index) => (
                <li key={stage.name}>
                  <span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                  <div>
                    <strong>{stage.name}</strong>
                    <p>{stage.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="landing-card-wrap">
            <LoginCard />
          </div>
        </section>

        <section className="landing-proof" aria-labelledby="pilot-loop-title">
          <div className="landing-section-heading">
            <p>Working Pilot Loop</p>
            <h2 id="pilot-loop-title">From Structured Work to Clinic Documents</h2>
          </div>
          <ol className="landing-proof-flow">
            {pilotLoop.map((step, index) => (
              <li key={step.label}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <strong>{step.label}</strong>
                <p>{step.detail}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="landing-operations" aria-labelledby="operations-title">
          <div className="landing-section-heading">
            <p>Course-Centered Clarity</p>
            <h2 id="operations-title">The Operational Truth Stays Together</h2>
          </div>
          <dl className="landing-signal-list">
            <div>
              <dt>Next Action</dt>
              <dd>Know what must happen before the course can advance.</dd>
            </div>
            <div>
              <dt>Owner</dt>
              <dd>Keep responsibility visible across clinical and operations teams.</dd>
            </div>
            <div>
              <dt>Blocker</dt>
              <dd>Surface missing evidence, review, or approval without hiding the work.</dd>
            </div>
            <div>
              <dt>Document Readiness</dt>
              <dd>Generate clinic-layout outputs from saved structured data.</dd>
            </div>
          </dl>
        </section>

        <aside className="landing-boundary" aria-labelledby="pilot-boundary-title">
          <div>
            <p>Pilot Boundary</p>
            <h2 id="pilot-boundary-title">Designed for Controlled Staff Evaluation</h2>
          </div>
          <p>
            Use synthetic or de-identified data only. Demo access is not production authentication, and prototype calculations are not clinical guidance.
          </p>
        </aside>

        <footer className="landing-footer">
          <span>CureRays Radiation Medicine</span>
          <span>Clinical Workflow System · Synthetic Data Pilot</span>
        </footer>
      </div>
    </main>
  );
}
```

- [ ] **Step 4: Make the form honest and natively validated**

Keep `handleSubmit` as a direct dashboard transition. Update the form content and attributes:

```tsx
<form onSubmit={handleSubmit} className="landing-login-card">
  <div className="landing-login-copy">
    <p className="landing-login-kicker">Pilot Workspace</p>
    <h2>Enter CureRays CRMS</h2>
    <p className="landing-login-subtitle">
      Demo mode accepts any valid email and a password of at least six characters.
    </p>
  </div>

  <div className="landing-login-fields">
    <label className="landing-field-label" htmlFor="email">
      Email Address
      <span className="landing-input-wrap">
        <Mail className="landing-input-icon" aria-hidden="true" />
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          className="landing-input"
          placeholder="name@curerays.com"
          required
        />
      </span>
    </label>

    <label className="landing-field-label" htmlFor="password">
      Password
      <span className="landing-input-wrap">
        <LockKeyhole className="landing-input-icon" aria-hidden="true" />
        <Input
          id="password"
          name="password"
          type={showPassword ? 'text' : 'password'}
          autoComplete="current-password"
          className="landing-input landing-password-input"
          placeholder="Enter at least six characters"
          minLength={6}
          required
        />
        <button
          type="button"
          className="clinical-focus landing-password-toggle"
          onClick={() => setShowPassword((current) => !current)}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          title={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? (
            <EyeOff aria-hidden="true" />
          ) : (
            <Eye aria-hidden="true" />
          )}
        </button>
      </span>
    </label>
  </div>

  <Button type="submit" className="landing-submit">
    Enter Pilot Workspace
  </Button>

  <p className="landing-secure-note">
    <ShieldCheck aria-hidden="true" />
    <span>Synthetic data only. No identity is authenticated in demo mode.</span>
  </p>
</form>
```

Do not render the divider or forgot-password button. Preserve the existing `aria-label` and `title` values on the password visibility toggle.

- [ ] **Step 5: Run the source guard and TypeScript check**

Run:

```powershell
rg -n "System_Logo_Landscape|redirect\\('/dashboard'\\)|Forgot password|Secure access" app/page.tsx app/login/page.tsx components/landing/login-card.tsx
```

Expected: no output.

Run:

```powershell
rg -n "required|minLength=\\{6\\}|router\\.push\\('/dashboard'\\)" components/landing/login-card.tsx
```

Expected: two `required` matches, one `minLength={6}` match, and one dashboard navigation match.

Run:

```bash
npm run typecheck
```

Expected: exit code 0.

- [ ] **Step 6: Commit the semantic and behavior change**

```bash
git add app/page.tsx app/login/page.tsx components/landing/login-card.tsx
git commit -m "Build course-centered pilot landing"
```

---

### Task 2: Orbital Clinical-Night Visual System

**Files:**
- Modify: `app/globals.css`

**Interfaces:**
- Consumes: the `landing-*` markup contract produced by Task 1 and the existing dark global tokens
- Produces: responsive desktop/laptop layout, glass form surface, orbit atmosphere, course path, proof flow, operational signals, pilot boundary, and reduced-motion/transparency behavior

- [ ] **Step 1: Replace only the existing `LANDING PAGE` CSS section**

Keep unrelated global CSS changes intact. Replace the block from the `LANDING PAGE` section comment through the line immediately before `ANALYTICS CLINICAL COCKPIT`.

The base layout must use these declarations:

```css
.landing-page {
  --height-landing-control: 48px;
  background: var(--color-bg);
  color: var(--color-text);
  isolation: isolate;
  min-height: 100dvh;
  overflow-x: hidden;
  position: relative;
}

.landing-page-frame {
  margin: 0 auto;
  max-width: 1440px;
  padding: 0 var(--space-page);
  position: relative;
  z-index: 2;
}

.landing-topbar {
  align-items: center;
  display: flex;
  height: 72px;
  justify-content: space-between;
}

.landing-hero {
  align-items: center;
  display: grid;
  gap: clamp(32px, 5vw, 72px);
  grid-template-columns: minmax(0, 1fr) minmax(360px, 440px);
  min-height: calc(100dvh - 72px);
  padding: 32px 0 56px;
}
```

Use `color-mix()` with existing dark tokens for atmosphere, borders, glass, and lines. Do not add literal color values inside the landing section.

- [ ] **Step 2: Establish the signature spatial hierarchy**

Implement all of these selector groups:

```css
.landing-ambient,
.landing-page::before,
.landing-page::after

.landing-orbit-canvas,
.landing-orbit-canvas canvas,
.landing-orbit-canvas-fallback

.landing-brand,
.landing-brand span,
.landing-logo,
.landing-pilot-marker

.landing-copy,
.landing-copy-block,
.landing-kicker,
.landing-title,
.landing-description

.landing-course-map,
.landing-course-map::before,
.landing-course-map li,
.landing-course-map li > span,
.landing-course-map strong,
.landing-course-map p

.landing-card-wrap,
.landing-login-card,
.landing-login-card::before,
.landing-login-copy,
.landing-login-kicker,
.landing-login-subtitle,
.landing-login-fields,
.landing-field-label,
.landing-input-wrap,
.landing-input-icon,
.landing-input,
.landing-password-input,
.landing-password-toggle,
.landing-submit,
.landing-secure-note
```

Required behavior:

- Orbit occupies the left two-thirds of the first viewport and never intercepts input.
- Headline remains `var(--type-title-size)` and `var(--font-weight-bold)`.
- Course stages render as a connected horizontal sequence on wide displays.
- Login card is a single 8px-radius glass module with high-contrast fields.
- Orange appears only through the logo and existing orbit material.
- The form remains fully visible at 1280×800 and 1440×900.

- [ ] **Step 3: Style the marketing proof and pilot boundary**

Implement these selector groups:

```css
.landing-proof,
.landing-operations,
.landing-boundary

.landing-section-heading,
.landing-section-heading > p,
.landing-section-heading h2

.landing-proof-flow,
.landing-proof-flow li,
.landing-proof-flow li::after,
.landing-proof-flow span,
.landing-proof-flow strong,
.landing-proof-flow p

.landing-signal-list,
.landing-signal-list div,
.landing-signal-list dt,
.landing-signal-list dd

.landing-boundary > div,
.landing-boundary > div > p,
.landing-boundary h2,
.landing-boundary > p

.landing-footer
```

Required behavior:

- Sections use different layout families: horizontal process, definition-list signal grid, then full-width boundary band.
- No marketing heading exceeds the project title role.
- The proof sequence is connected without a filled progress track.
- The footer contains no version number, fake compliance seal, or duplicate CTA.

- [ ] **Step 4: Preserve motion and fallback accessibility**

Keep one entry animation and one ambient animation:

```css
@keyframes landing-enter {
  from {
    opacity: 0;
    transform: translate3d(0, 14px, 0);
  }

  to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
}

@keyframes landing-aurora-shift {
  from {
    transform: translate3d(-2%, 0, 0) scale(1.01);
  }

  to {
    transform: translate3d(2%, -1%, 0) scale(1.04);
  }
}
```

Add:

```css
@media (prefers-reduced-motion: reduce) {
  .landing-ambient,
  .landing-card-wrap,
  .landing-copy,
  .landing-proof,
  .landing-operations,
  .landing-boundary {
    animation: none;
    transform: none;
  }
}

@media (prefers-reduced-transparency: reduce) {
  .landing-login-card {
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
    background: var(--color-card);
  }
}
```

At `max-width: 1023px`, collapse the hero to one column and center the form. At `max-width: 720px`, collapse process and signal grids to one column. Do not add mobile-only content or a second navigation pattern.

- [ ] **Step 5: Run the project verification gate**

Run:

```bash
npm run verify
```

Expected: typecheck, lint, typography guardrails, UI-copy guardrails, and color guardrails all exit successfully.

- [ ] **Step 6: Perform one focused browser verification**

Start or restart the development server, then inspect `/login` using mock data only.

Check at 1440×900 and 1280×800:

- Logo loads from `/System_Logo.svg`.
- Proposition and full form are visible in the first viewport.
- Course stages remain legible and do not overlap the form.
- Empty submit stays on `/login`.
- Malformed email stays on `/login`.
- A valid email plus six-character password enters `/dashboard`.
- Tab order reaches email, password, visibility toggle, then submit.
- Reduced motion leaves a readable static composition.
- No horizontal overflow appears.

- [ ] **Step 7: Commit the visual system**

```bash
git add app/globals.css
git commit -m "Polish orbital pilot landing visuals"
```

---

### Task 3: Final Diff and Scope Verification

**Files:**
- Verify: `app/page.tsx`
- Verify: `app/login/page.tsx`
- Verify: `components/landing/login-card.tsx`
- Verify: `app/globals.css`

**Interfaces:**
- Consumes: completed Tasks 1 and 2
- Produces: evidence that the landing implementation is complete and unrelated work remains untouched

- [ ] **Step 1: Inspect the exact implementation diff**

Run:

```powershell
git diff HEAD~2 -- app/page.tsx app/login/page.tsx components/landing/login-card.tsx app/globals.css
```

Confirm the diff contains only the approved route, landing composition, demo form, and landing CSS changes.

- [ ] **Step 2: Confirm prohibited claims and missing assets are absent**

Run:

```powershell
rg -n "HIPAA compliant|production.ready|secure access|authorized clinical staff|System_Logo_Landscape|Forgot password" app/page.tsx app/login/page.tsx components/landing/login-card.tsx app/globals.css
```

Expected: no output.

- [ ] **Step 3: Confirm the working tree still contains the user’s unrelated changes**

Run:

```powershell
git status --short
```

Expected: unrelated pre-existing modifications remain present and unstaged unless they were already staged by the user.
