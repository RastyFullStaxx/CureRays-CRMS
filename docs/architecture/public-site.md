# Public Clinic Site

Decision record for the patient-facing site at `/` and the design-system changes it required. This is the recorded-decision document that [`../../CLAUDE.md`](../../CLAUDE.md) requires for new dependencies.

## Why This Exists

CureRays CRMS was a single authenticated app. `/` redirected to `/login`, and the only marketing-looking surface lived inside `app/login/page.tsx` — a product pitch aimed at staff evaluating the pilot.

The clinic needs a real public website for patients and referrers, built from CureRays' own published content. The CRMS app becomes the admin side behind sign-in. Both sides now share one brand.

Two superseded specs under `../superpowers/specs/` state the landing is "not patient-facing and is not a public sales lead funnel". That was true of the old `/login` landing. It is no longer the direction. Those specs are historical.

## Route Split

```
app/
  layout.tsx        html/body, Inter, theme script. Static.
  (site)/           Public. Static, responsive, indexable.
  (app)/            Authenticated. Dynamic, desktop-only, noindex.
  login/            Sign-in only.
  api/              Unchanged.
  robots.ts         Metadata routes must sit at the app root — inside a
  sitemap.ts        route group, robots.txt 404s.
```

The split is not cosmetic. `app/layout.tsx` previously called `hydrateClinicalStoreFromDatabase()` and `cookies()` on every render, so an anonymous visitor to a marketing page triggered clinical-store hydration and `cookies()` forced the entire tree dynamic. Those calls now live in `app/(app)/layout.tsx`.

`components/app-shell.tsx` previously string-matched `pathname === '/' || pathname === '/login'` to skip the chrome. Chrome is now decided by file location, so adding a public page cannot forget to opt out. The component is no longer a client component.

`lib/site-routes.ts` is the single source of public paths, imported by both `proxy.ts` (middleware) and the site header and footer. Adding a public page is one line in one file. Keep it free of Node APIs and heavy imports — it is bundled into middleware. Page copy lives in `lib/site-content.ts` so the copy blob never reaches the edge bundle.

## Typography

Two scoped systems, and only two:

| Surface | Faces | Scale |
|---|---|---|
| `app/(app)/**`, `app/login` | Inter via `next/font/google` | `--type-*` (12 / 13 / 14 / 18) |
| `app/(site)/**` | Display serif + text sans | `--site-*` (fluid `clamp()`) |

The site faces are applied as CSS variables on the site root element only. Custom properties descend, so the authenticated app cannot inherit them.

`--font-site-display` and `--font-site-text` carry **inline fallbacks** (`var(--font-zodiak, Georgia)`). This is load-bearing: `var(--undefined)` with no fallback makes the whole `font-family` declaration invalid at computed-value time and the element silently inherits Inter instead of falling back to a serif.

`scripts/typography-guardrails.mjs` asserts `globals.css` holds exactly three `font-family` declarations, in order. Adding a fourth is a deliberate act that must update that assertion.

### The face

**Roboto**, loaded through `next/font/google` in `app/(site)/layout.tsx`. One family carries both roles, separated by weight rather than by a contrast of form: 700 at display and heading sizes, 400/500 for reading.

`--font-site-display` and `--font-site-text` stay distinct even though both currently resolve to Roboto, so a separate display face can be reintroduced later without touching every rule that consumes them.

Two earlier directions were rejected on licence grounds, recorded so they are not revisited:

- **Editorial New** (Pangram Pangram) — free to try only; commercial licences start at $40.
- **Zodiak + Switzer** (Fontshare) — Fontshare ships two tiers, and the ITF Free Font Licence prohibits redistributing font files and requires written consent to self-host. This repository is public, so committing those `.woff2` would be redistribution.

The rule that follows: **use a face whose licence permits redistribution in a public repo.** Anything on Google Fonts qualifies, and `next/font/google` self-hosts it at build time. Do not load fonts from a third-party CDN — `globals.css` must not reference remote fonts (guardrail), and a clinic site should not leak visitor IPs.

## Visual World — Aperture

CureRays *is* directed light: the mark is an orange sunburst and the product is a focused beam. The site is built on that rather than on clinic-website convention — a warm source, a hard edge, and material caught in the beam.

It carries three habits the craft floor names as category defaults, now removed: an eyebrow over every section (one named kicker survives, in the hero), `01 / 02 / 03` section numbering, and same-size cards as the page structure. Modalities are a list with a spine; attributes are the gallery.

## Colour

Three non-true brand families replace the previous `#0033A0` / `#FF671F`:

| Role | Light | Dark |
|---|---|---|
| Ink (`--color-text`) | `#1A1D21` | `#EDE9E3` |
| Bone (`--color-bg`) | `#F5F2ED` | `#0E1113` |
| Brand (`--color-primary`) | `#1F5F5B` | `#8FC6C0` |

### The site leads with orange; the app does not

The public site has its own brand hue, declared on `.site-page`:

| Token | Value | Job |
|---|---|---|
| `--site-brand` | `#B13F21` | Section grounds, calls to action, links, kicker |
| `--site-brand-deep` | `#7E2A16` | Gradient stop, hover |
| `--site-brand-lit` | `#F0BC90` | Accent marks on a brand ground |
| `--site-on-brand` | `#F5F2ED` | Text on a brand ground |
| `--site-on-brand-muted` | `#F5E4DB` | Secondary text on a brand ground |

`data-tone="brand"` replaces the old `ink` tone, so the dark sections are burnt orange rather than near-black.

**This deliberately does not extend to the clinical app.** A red-orange primary there sits a few degrees from `--status-negative-solid` (`#9E3B32`), and a primary action that reads as an error is a patient-safety problem, not a taste one. The app keeps petrol. The two surfaces share the ink and bone neutrals, the type system, and the spacing scale; only the brand accent differs, and it differs for a stated reason.

`scripts/contrast-check.mjs` covers the brand pairs too — 76 pairs total. It rejected the first `--site-brand-lit` at 2.65:1 against the brand ground.

Token **values** changed; token **names** did not. `--color-primary` is a role name ("interaction"), not a hue name, so every existing screen inherited the new palette without edits.

`--color-accent` and all `--landing-color-*` tokens are **deleted**. The accent had exactly one consumer, `brand-wave-background.tsx`, which had no importers and was removed.

The four clinical status tones keep their own hues — they are functional, not decorative — retuned off-true to sit inside the brand system. Their borders are markedly darker than the previous pastels, which measured around 1.6:1 against their surfaces and failed WCAG 1.4.11.

`.clinical-focus:focus-visible` previously used a 16%-alpha ring measuring roughly 1.2:1. It is now a two-ring indicator (page-colour spacer, then the brand ring) that works on any surface.

`scripts/contrast-check.mjs` runs inside `npm run verify` and asserts 68 foreground/background pairs across both themes, plus the absence of pure black and pure white. It caught four dark-mode borders during this work that would otherwise have shipped failing.

## shadcn/ui

### Bridge by mapping, not duplicating

shadcn's Tailwind v3 preset expects HSL triplets (`--background: 0 0% 100%`) consumed as `hsl(var(--background))`. Adding those alongside the existing hex tokens would create two sources of truth and guaranteed drift. **No HSL aliases were added.** Instead `tailwind.config.ts` maps Tailwind colour *names* onto the existing custom properties.

`accent` is deliberately absent from that map — a `bg-accent` class would resurrect a concept the palette no longer has.

Known cost: opacity modifiers (`bg-primary/90`) do not work against opaque `var()` values. Every vendored component is retokenized by hand anyway. Do not re-add `/NN` suffixes.

`npx shadcn init` was **not** run. It rewrites `globals.css` and `tailwind.config.ts`, and the only things it produces that we want — `components.json`, `lib/utils.ts`, and dependency entries — are three files we can write correctly ourselves. `npx shadcn add <component>` still works because it reads `components.json`.

### Retokenizing is mandatory

Registry components ship Tailwind palette colours and `text-*`/`font-*` utilities that this repository bans. Anything pasted from the registry must be rewritten before it will pass `npm run verify`:

| Emitted | Rejected by | Rewrite to |
|---|---|---|
| `bg-black/80` | colour | `bg-[var(--color-overlay)]` |
| `bg-white`, `text-slate-*` | colour | token equivalents |
| `text-xs` … `text-2xl` | typography | `type-*` / `site-*` roles |
| `font-medium`, `font-semibold` | typography | delete; weight comes from the role class |
| `rgba(`, `hsl(`, inline hex | phase0 | strip |
| `tracking-tight` | *nothing yet* | remove anyway — `../design/typography.md` forbids it |

Safe as generated: `bg-background`, `text-foreground`, `bg-card`, `bg-primary`, `bg-muted`, `bg-destructive`, `border-input`, `ring-ring`.

### Components

**Vendored: `sheet` only.** It is the public site's mobile navigation drawer. The repository already ships an accessible dialog (`components/ui/modal.tsx` — focus trap, `inert` siblings, Escape, scroll lock, focus restore), correct tabs (`components/shared/tab-strip.tsx` — roving tabindex), and a native `<select>`. A side drawer is not what `Modal` is sized for, and adapting it would fork tested behaviour.

**Boundary: `Modal` serves the authenticated clinical surfaces. `Sheet` serves the public site.**

Rejected, so this is not re-argued:

| Rejected | Why |
|---|---|
| `navigation-menu` | Five flat destinations, no dropdowns (Hick) |
| `accordion` | Native `<details>` is accessible with zero JavaScript |
| `tabs`, `dialog` | Already covered by better-tested local components |
| `card`, `button`, `badge`, `separator` | Exist; the site has its own `.site-*` language |
| `carousel` | A dependency for a pattern users ignore |
| form components | The site has no form — see below |

`cva` arrives as a `sheet` dependency. Existing primitives keep their working object-map variants; rewriting them onto `cva` is churn with no behaviour change.

### Reduced motion

`.sheet-overlay` and `.sheet-content` use `animation-duration: 0.01ms` under `prefers-reduced-motion`, never `animation: none`. Radix Presence unmounts on `animationend`; removing the animation outright fires no such event and would strand the drawer mounted with the page scroll still locked.

### New dependencies

Recorded per the repository rule that new dependencies need a decision document.

| Package | Why |
|---|---|
| `@radix-ui/react-dialog` | Focus trap, scroll lock, and dismissal for `sheet` |
| `class-variance-authority` | Required by the vendored `sheet` |
| `clsx`, `tailwind-merge` | Back `cn()` in `lib/utils.ts` |
| `tailwindcss-animate` | `sheet` enter/exit animation utilities |
| `motion` | Scroll-linked reveals, the aperture gallery, and figure counters on the public site only |

## Motion

`components/site/site-motion.tsx` holds the primitives; `components/site/site-gallery.tsx` holds the one authored moment. Everything else enters once, quietly.

Every export checks `useReducedMotion()` and renders a **static** equivalent, not a faster animation — the setting means "no motion".

Two traps this work hit, both worth not repeating:

- **A reveal must not defeat its own trigger.** The gallery panels start at `clip-path: inset(0 0 100% 0)`, so they report an `intersectionRatio` of 0. Any fractional `viewport.amount` can never be met and the panel hides itself permanently. `amount: 'some'` (threshold 0) is required, and is load-bearing rather than lazy.
- **Do not derive an effect dependency in render.** The figure counter parsed its value into an array during render and listed it in the `useEffect` deps. Since each frame calls `setShown`, the effect re-ran and restarted the count from zero forever. Parse inside the effect; depend on primitives.

Layout properties are never animated. The header condenses through material and a scaled mark, not padding — it is sticky, so animating a layout property would force layout on the whole page for every frame. The modality rule sweeps with `scaleX`, not `width`.

## Imagery

`public/site/` holds five plates, all **generated with Google Gemini** and each reviewed before it was committed:

| File | Subject | Used by |
|---|---|---|
| `aperture.jpg` | Warm light through a narrow aperture onto plaster | Hero |
| `beam.jpg` | A single blade of amber light crossing a dark interior | Gallery — *Invisible* |
| `diffuse.jpg` | Soft light through frosted glass, no hard edges | Gallery — *Painless* |
| `grain.jpg` | Terracotta and bone-white plaster meeting along an edge | Gallery — *Scar-Free* |
| `isodose.jpg` | Concentric rings of light falling off into shadow | Gallery — *Anti-Inflammatory* |

Each plate is matched to the attribute it illustrates rather than dropped in for decoration. Total weight is under 400 KB: `sharp` resizes and re-encodes to progressive mozjpeg at q82, and trims the letterbox bars the generator adds.

**No people, generated or otherwise.** Synthetic "clinicians" and "patients" on a real clinic's site would misrepresent the practice as surely as stock models would. Every factual claim lives in the copy, which comes from what the clinic publishes; the pictures carry the idea, not evidence.

Two things to know:

- The plates carry Gemini's visible sparkle marker in a corner, and Google's invisible SynthID regardless. They were left in place. Removing a provenance marker from AI imagery is the clinic's decision to make knowingly, not something to strip silently.
- **Real photography of the Grass Valley clinic would beat all of this.** Generated abstracts are a strong placeholder for a mood; they cannot show a patient the room they will actually sit in.

Still to supply: clinic exterior, Dr. Hess portrait, treatment room, an OG image at 1200×630, and a favicon set.

### Regenerating a plate

The images are keyed by filename, and **Next's image optimizer caches on that key**. Replacing a file in place while keeping its name will serve the stale optimization even after a dev-server restart — delete `.next` entirely, not just `.next/cache/images`. Verify with `img.naturalWidth` in the browser, not by eye.

`cn()` moved from `lib/workflow.ts` to `lib/utils.ts`. Not `@/lib/workflow` — pointing the shadcn utils alias at a 600-line domain module drags workflow code into every UI primitive's bundle. The move also fixed a latent bug: the old implementation joined classes verbatim, so `cn('bg-[var(--color-card)]', className)` emitted both and the winner depended on CSS source order.

## Content and Claims

`lib/site-content.ts` holds every string. All of it comes from CureRays' own published material.

**Do not add outcomes, efficacy, safety, regulatory, or compliance claims the clinic has not published itself.** The clinic is the authority on its own content; this repository is not.

The five named programs (Keep Cancer Away, Keep Arthritis Away, CureRays Institute, Clinical Outcomes, Join CureRays) are listed on `/about` but not linked. We have no copy for them, and five empty routes would invent claims.

**Contact is real contact information, never a form.** Every affordance is a `tel:`, `mailto:`, or map link. There is no email or booking provider configured, and `PRODUCT.md` forbids prototype actions that fake durable work. A guardrail asserts `site-contact-card.tsx` contains no form elements.

### Asset gap

The repository has `System_Logo.svg` and `curerays-treatment-geometry.png`. A clinic site would normally carry photography we do not have, and inventing stock patient imagery would violate the content rule above. The design is therefore type-led and editorial.

To supply later: clinic exterior, Dr. Hess portrait, treatment room, logo lockup, an OG image at 1200×630, and a favicon set.

## Responsive Boundary

The public site is fluid from 390 to 1920. The authenticated app remains desktop and laptop only.

The boundary is expressed three ways so it cannot drift:

1. **Directory** — responsive CSS lives only in the `.site-*` block.
2. **Technique** — `clamp()` gutters and type, `repeat(auto-fit, minmax(min(100%, Npx), 1fr))` grids. Exactly two breakpoints: 768px swaps the drawer for inline navigation, 1160px opens the two-column reading measure. A guardrail asserts the count.
3. **Docs** — `AGENTS.md` and the `CLAUDE.md` cut list are scoped to the authenticated app.

`.site-page` sets `grid-template-columns: minmax(0, 1fr)`. This is load-bearing: the implicit column otherwise sizes to max-content and pushes every descendant past the viewport on narrow screens.

## Verification

`npm run verify` covers typecheck, lint, typography, UI copy, colour, and contrast. Beyond that:

- `node scripts/route-smoke.mjs` — every route still resolves after the group move.
- `node scripts/hipaa-guardrails.mjs` — the public home is in `operationalPages`, so it can never import PHI-bearing data.
- `node scripts/product-simplification-guardrails.mjs` — login carries no marketing, the site holds at five destinations and two breakpoints, contact has no form, calls to action stay at 48px.

Known unverified: the drawer's unmount-after-exit-animation could not be confirmed in the local browser harness, which reports `document.visibilityState === 'hidden'` and freezes CSS animations at `currentTime: 0`. Open state, focus trap, scroll lock, ARIA, and Radix's close-state transition were all confirmed. Confirm the exit path in a real browser or with Playwright browsers installed.
