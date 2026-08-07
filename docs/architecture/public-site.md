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

## The hero field

The hero ground is not a photograph. It is a canvas that grows a vascular bed, holds it, dissolves it, and grows another: [`hero-field-renderers.ts`](../../components/site/hero-field-renderers.ts) owns the simulation and the paint, and [`site-hero-field.tsx`](../../components/site/site-hero-field.tsx) owns sizing, the frame loop, pointer easing, the off-screen pause, and reduced motion. The renderer knows nothing about the DOM; the host knows nothing about vessels.

Growth is space colonisation — attractors pull the nearest node toward them and are consumed on arrival, which is how real vasculature fills a volume.

**It is bounded.** It cycles `growing → holding → dissolving → reseed`, roughly 4s / 15s / 3.2s:

- At `SEGMENT_LIMIT` segments (or when the attractors run out) it stops adding geometry and bakes itself to an offscreen canvas. An earlier version had no limit and kept regrowing over its own accumulated canvas; within a minute it was an unreadable tangle.
- While holding, the frame is that blit plus a slow perfusion wave running trunk to capillary, and a soft highlight under the pointer. Nothing is added.
- It then **dissolves** under an accelerating bone wash, and only when the canvas is clear is a fresh bed seeded from new random roots. Clearing outright reads as a glitch; washing out reads as an exhale, and it is the same material the growth was already sitting under.

Reduced motion gets the finished bed and stops there — no hold clock, no dissolve, because a repeating loop is precisely what that preference is asking not to see.

### The paint: clean and opaque, decided by review

**Every stroke is fully opaque, its colour pre-mixed toward the page ground to carry the fade.** This is a reviewed decision, not an incidental one, and it is worth knowing the alternative that was rejected.

A translucent variant was built and shown: hairline strokes at low alpha under a slow bone wash, which bead where short segments overlap at the joins and dry into greys and pale oranges. It is atmospheric, and it was tried more than once. It was rejected in favour of the clean web — the beading reads as dotted twigs at hero scale, and the field is meant to have graphic presence behind a display headline, not to recede into texture.

So: do not "restore" translucency, a growth wash, or taper-derived alpha here. If the delicate variant is ever wanted again it is a deliberate change, not a fix.

Two settings own the bed's *shape*, and both were changed once by accident while other work was going on:

- Roots are **scattered across the field with random headings**. Seeding them along an edge makes every branch fan out of one corner.
- Attractors are **sparse and spread over the whole field**, with a long reach and a generous kill radius. Raising their count and shortening the reach turns the sweeping web into something leaf-like.

The bed is allowed to grow across the reading column — the veil keeps the copy legible, not the growth rules.

One thing that is load-bearing for performance: **nodes live in a coarse spatial grid keyed on the attractor reach**, so each attractor tests a 3×3 neighbourhood instead of every node. Without it the nearest-node search is `O(attractors × nodes)` and the first paint drops frames.

> If a translucent variant is ever reinstated, note that measuring it by canvas alpha does not work — its wash covers every pixel, so alpha saturates within a second and any "is it drawing?" check reads as full. Measure luminance against the bone ground instead.

## Angular, not rounded

The public site carries **no circular edge elements at all** — no pills, no dots, no round avatars — and square corners everywhere. Where a marker is needed it is a chamfer or a rotated square, cut with `clip-path` or a 45° rotation. This is a brand decision for the site surface, so it lives in `--site-radius` / `--site-chamfer` on `.site-page`; the clinical app keeps the shared `--radius-*` scale.

The hero canvas is the one exception: its line caps are round. Vessels are drawn as a chain of short segments, and square caps leave notches at every direction change. This is geometry, not styling.

One rule that is easy to break: **`clip-path` never goes on an interactive element.** The `.clinical-focus` ring is drawn as an outside `box-shadow`, and a clip erases it. The telephone button gets its chamfer from a pseudo-element carrying the fill; `.site-button` is square rather than chamfered for exactly this reason.

The gallery captions carry pictograms from [`site-attribute-icon.tsx`](../../components/site/site-attribute-icon.tsx) — straight segments only, mitred joins, square caps. Each has to survive being read at 20px, which rules out interior detail: an abstract mark that needs its label to be understood is no better than the bullet it replaced. Sutures-struck-out was the honest metaphor for *Scar-Free* and had to be abandoned because three ticks and a slash collapse into a scribble at that size.

## The attributes section

Four plates on a brand ground, one per published treatment attribute. Three things about it are decisions, not defaults.

**Captions sit below the frames, never over them.** They used to be laid over the image. The plates parallax as you scroll, so the pixels behind the text changed continuously — contrast was a different value at every scroll position, and sampling the rendered backdrop measured *Anti-Inflammatory* at 2.41:1 against a 3:1 requirement. No amount of scrim tuning fixes text on a moving photograph. Below the frame the pair is bone-on-brand: fixed, and covered by `scripts/contrast-check.mjs`.

**A brand ground may be darkened, never lightened.** Bone body text on flat `--site-brand` measures 4.72:1 — it clears 4.5:1, but with so little headroom that a 6% wash of `--site-brand-lit` drops it to 4.36:1. Depth in the `data-tone="brand"` background therefore comes only from `--site-brand-deep` pools. This is enforced: `contrast-check.mjs` asserts the rule directly, because a `color-mix` inside a gradient is not a token pair and the existing pair checks cannot see it. A lit bloom was added for depth, shipped past the gate, and had to be caught by hand.

**The four plates are graded to one tonal family.** As generated their mean luma spanned 35–172 and warmth 5–79 — four unrelated crops rather than a set, with the palest fighting the orange hardest. They are committed **already graded**, so a grading pass re-run against `public/site/` would double-apply; grade from an original if one is ever needed again. `beam` and `diffuse` also needed `sharp`'s `tint`, which applies chroma while preserving luminance — brightness alone left them neutral and split-toned respectively.

Two consequences worth remembering: the frames are one shared **4:3** aspect so the set reads as a set (`object-fit: cover` handles the portrait sources), and the right column's lift is deliberately small. At 54px no two captions could ever align, which read as breakage rather than rhythm.

Reduced motion still gets the finished hero bed: the host runs frames until it has grown, then draws that state once and never schedules another.

## The treatments figure

The modality list is paired with a canvas that reconfigures as you move through it: [`modality-figure-renderers.ts`](../../components/site/modality-figure-renderers.ts) owns the formations and the paint, [`treatment-explorer.tsx`](../../components/site/treatment-explorer.tsx) owns selection and the frame loop. Pointing at a row or tabbing to it retargets a field of ~260 angular marks, and each eases to its new place on a per-mark stagger so the field turns over as a wave rather than translating as a block.

**Each formation illustrates that modality's own published description, and nothing beyond it.** A purely abstract version was built first and rejected: claim-free, but with no relationship to the copy beside it, so it read as decoration.

| Modality | Published wording | Deposit |
|---|---|---|
| SRT | "treat skin cancer at the surface" | tight, just under the surface |
| LDRT | "very low doses… over a short series" | sparse, spread, in session clusters |
| SRT for keloids | "follows keloid removal… causes scars to return" | a thin line on the surface itself |
| DEEP-SRT™ | "conditions that sit below the skin surface" | concentrated well below the surface |

The beam above the surface is **constant** across all four — it is always x-rays from a source — so the eye reads only the deposit as changing, which is exactly what the copy varies. The surface rule is the one datum everything is measured against: "at the surface" and "below the surface" mean nothing without it, so it is drawn solid while the rest of the stage stays faint.

> ### ⚠ Needs clinical sign-off before launch
>
> This is schematic, and it makes a **relative visual statement about delivery**. It illustrates published copy rather than inventing a claim, but a clinical owner has to agree the illustration is faithful before it goes in front of patients.
>
> There are deliberately **no numbers, no scale and no falloff curve** — those would be clinical data rather than an illustration of copy. Do not add them. If sign-off is withheld, the fallback is the abstract formation set, recoverable from this file's history.

Accessibility shaped three things:

- The figure is `aria-hidden` and **nothing is available only through it**. The list carries every word; the canvas adds no information.
- Selection is driven by `onMouseEnter` **and** `onFocus`, so a keyboard user tabbing the list drives it too — and the active row is marked in the list itself, since a keyboard user cannot see an `aria-hidden` canvas.
- Reduced motion gets each formation *arrived at* rather than travelled to: the easing is run to completion off-screen and painted once. The frame loop never starts.

Below the two-column breakpoint the panel is `display: none` rather than stacked. It is decorative, and a full-width canvas above a list of four links would be the loudest thing on a phone for no informational gain. Hiding it also parks the loop — an `IntersectionObserver` reports a `display: none` element as not intersecting.

## The condition map

The conditions list is paired with a body map: selecting a condition marks the region it affects and names it in text. It answers the question a patient actually arrives with — *where is this treated?* — and needs no photography to do it. The figure is straight segments only, `aria-hidden`, and the region is stated in the caption, so nothing is available only by pointing at a drawing. The tags are buttons rather than links; `<button>` takes the user agent's font unless told otherwise, which is why `font-family: inherit` is a legitimate fourth entry in the typography guardrail's whitelist.

> ### ⚠ Site mapping needs clinical sign-off
>
> Most entries come from the condition's own name — hand arthritis to the hands, Graves' eye disease to the head, gynecomastia to the chest. Two are eponymous and rest on clinical knowledge rather than the words themselves: **Ledderhose** and **Peyronie's**. Anything whose name does not state a site — Ossification, Fasciitis, Contracture, Select infections, Desmoid fibromatosis — is deliberately marked *"occurs at several sites"* rather than being assigned one. Do not assign them a region without clinical input.

## The brand orange is two tokens, not one

`--site-brand` is **#F05A28**, sampled from the CureRays mark itself. It measures **3.03:1 on bone** — enough for a rule, a stroke, a border or a canvas mark, and not enough to be text or to sit behind text.

So the orange splits by job:

| Token | Value | On bone | Job |
|---|---|---|---|
| `--site-brand` | `#F05A28` | 3.03:1 | Rules, strokes, borders, canvas marks. **Never text, never behind text.** |
| `--site-brand-ink` | `#AD411D` | 5.31:1 | Brand-coloured text, and any fill carrying bone text — including the `data-tone="brand"` ground. |
| `--site-brand-deep` | `#843216` | 7.7:1 | Deep gradient pools and hovers. |
| `--site-brand-lit` | `#F0BC90` | — | Accent marks on brand grounds. |

`--site-brand-ink` is the same hue at 72%, so the family reads as one colour. It sits at −28% rather than a rounder −25% because muted bone text on the latter measured **4.49:1** against a 4.5 requirement — `contrast-check.mjs` caught it, and the gate now asserts both bars: ink ≥ 4.5:1 as text, mark ≥ 3:1 as a mark.

**Reaching for `--site-brand` because it looks more like the logo is the mistake to avoid.** Any use as a text colour or as a ground behind text fails contrast, and the checker will say so.

### Navigation legibility

The header carries no fill, so its links sit on whatever passes beneath — at the top of the homepage that is the hero field. They were `--color-text-muted` (#5F656B), which read as invisible over a busy ground and was reported twice. Destinations now take the full `--site-header-fg`: **15.15:1** on bone at the top, **5.30:1** over a brand section. Only the wordmark's second line stays muted.

## Discoverability baseline

An audit found the site shipping with **no `<h1>` on five of six routes**, no Open Graph tags, no canonicals, and `MedicalClinic` structured data on `/contact` alone. All four are fixed and the fixes are structural rather than per page:

- `SiteSection` takes a `level` prop. Sections default to `h2`; the first section on a page is that page's `h1`. Every sub-page led with a section, which is why none of them had one.
- `sitePageMetadata()` in [`lib/site-metadata.ts`](../../lib/site-metadata.ts) gives each route its own canonical and social card. Without `metadataBase` in the root layout, Next emits relative `og:url`, which crawlers ignore.
- `SiteStructuredData` renders the clinic entity on **every** page from the site layout. Its JSON escapes `<` — every value is a compile-time constant today, but `</script>` inside a string would otherwise close the tag early.

**Content gating.** A route may carry `draft: true` in [`lib/site-routes.ts`](../../lib/site-routes.ts). Drafts stay reachable but are excluded from `SITE_NAV_ROUTES` and from `SITE_INDEXABLE_ROUTES`, which the sitemap consumes. `/patient-information` additionally sets `robots: noindex` until every section can answer a question, and renders only answers marked published. **An unanswered question is better than an invented one** — see [content gaps](../product/public-site-content-gaps.md).

**Trust slots.** [`lib/site-assets.ts`](../../lib/site-assets.ts) holds the practice's photography and patient quotes. Every slot is `null` or empty and every consumer returns `null` while it stays that way — no grey boxes, no "coming soon", no stock stand-in a visitor could mistake for the real clinic. The CSS is written now so a supplied asset lands into a finished design.

## On clinical photography

The CRMS tracks clinical photographs — a *Clinical Photos / Skin evidence* counter, an `Attach Image` action, dermoscopy and required-photograph checklists. **None of it can appear on this site.**

A clinical photograph of a patient is PHI. Marketing use of PHI requires written authorization from the individual under HIPAA §164.508, and this repo's standing rule is that PHI never reaches a client bundle. That makes it a legal gate rather than an editorial preference, and it holds even for images that look de-identified.

What can be used, if the clinic supplies it: licensed stock clinical imagery, or patient photographs accompanied by a signed release. Until then the site's visuals are generated from the clinic's own published content — the hero bed, the treatments figure, this map, and the cohort field — which is why none of them depend on assets the clinic does not have.

## The practice figures

The proof block's visual is made of its own numbers rather than decorating them: [`cohort-field.tsx`](../../components/site/cohort-field.tsx) draws **1,500 marks, one per patient served**, with the most recent 300 picked out — the same two figures the adjacent stats state, and nothing invented. It reveals once on entering view and then **stops its loop**; there is nothing left to animate, and a 1,500-stroke frame repeating behind static content is pure waste.

The figures themselves are stacked value-over-label in a 2×2. As a four-row list with a fixed `7rem` value column they had two structural faults: `1,500+` overflowed the track into its own label, and `5-Star` wrapped to `5-` / `Star`. Stacking removes the shared track, so no figure can be clipped by another's width; `white-space: nowrap` on the value covers the hyphen. `auto-fit` is not enough here — it fitted three across and stranded the fourth alone on a row.

**A canvas has no intrinsic width**, so it collapses under any fit-content sizing. `.site-practice-copy` sets `justify-items: start`, which did exactly that. The `justify-self: stretch` has to go on the `Reveal` wrapper, because *that* is the grid item — not the figure inside it.

## Section anatomy

`SiteSection` is a two-column grid at desktop: heading in (1,1), content in (1,2). Two consequences bite repeatedly.

**Never pass a section-level link as a child.** A second child auto-places into **(2,1)** — the left column, in a new row, hundreds of pixels below the copy it belongs to and beside nothing. Both `#treatments` and `#conditions` shipped that way, with the CTA stranded ~370px under the lead. Use the **`action` prop**, which renders it under the lead where the eye returns after scanning the content.

**A flex list in the content column will stretch.** As a grid item it fills its row's full height, and a wrapped flex container then spends that height on its lines (`align-content: stretch`) *and* its items (`align-items: stretch`). `.site-tag-list` rendered ~90px-tall boxes with each label stranded at the top; the fix is `start` on both, plus `align-self: start` on the list itself.

The modality rail leads with **what each modality treats** (`appliesTo`), not only its abbreviation. Two of the four homepage entries are both "SRT", and a column of repeated initialisms reads as a duplication error while answering none of the question a patient arrives with. The conditions stack rather than joining with `·`, which strands the separator at a line end in a rail that narrow.

## Imagery

`public/site/` holds four plates, all **generated with Google Gemini** and each reviewed before it was committed:

| File | Subject | Used by |
|---|---|---|
| `beam.jpg` | A single blade of amber light crossing a dark interior | Gallery — *Invisible* |
| `diffuse.jpg` | Soft light through frosted glass, no hard edges | Gallery — *Painless* |
| `grain.jpg` | Terracotta and bone-white plaster meeting along an edge | Gallery — *Scar-Free* |
| `isodose.jpg` | Concentric rings of light falling off into shadow | Gallery — *Anti-Inflammatory* |

Each plate is matched to the attribute it illustrates rather than dropped in for decoration. Total weight is under 400 KB: `sharp` resizes and re-encodes to progressive mozjpeg at q82, and trims the letterbox bars the generator adds. `isodose.jpg` is narrower than its source (614px, not 768px) — it carried black bands down both sides that were invisible in the old portrait crop and obvious once the frames became 4:3.

All four are **committed already graded** to one tonal family; see the attributes section above before re-running any grading pass over them.

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
