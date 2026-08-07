# Navigation and Page Responsibilities

**Status:** Canonical product structure

## Two Surfaces

| Group | Routes | Audience | Auth |
|---|---|---|---|
| `app/(site)/**` | `/`, `/treatments`, `/conditions`, `/services`, `/patient-information`, `/about`, `/contact` | Patients and referrers | Public |
| `app/login` | `/login` | Clinic staff | Public, sign-in only |
| `app/(app)/**` | Everything below | Clinic staff | Session required |

`/` is the public clinic home. It no longer redirects to `/login`; `proxy.ts` allows the public paths through `isSitePath()` from `lib/site-routes.ts`. `robots.ts` disallows every authenticated route.

Decision record: [`../architecture/public-site.md`](../architecture/public-site.md).

## Public Site Pages

| Route | Responsibility |
|---|---|
| `/` | Clinic home: promise, treatment attributes, headline treatments, conditions, practice facts, founder, contact |
| `/treatments` | Every modality with what it treats. Full page rather than a menu, because the list is irreducible |
| `/conditions` | Conditions treated, as disclosures, each linked to its associated therapy |
| `/services` | Screening, procedures, medical management, and research |
| `/patient-information` | **Draft.** The questions patients ask before booking. Renders only answers the clinic has published; `noindex` and absent from nav and sitemap until every section can answer at least one. See [content gaps](public-site-content-gaps.md) |
| `/about` | Belief, purpose, promise, founder, specialty areas, recognition, programs |
| `/contact` | Real telephone, email, address, and map links plus `MedicalClinic` structured data |

The public site carries no form. Every contact affordance is a `tel:`, `mailto:`, or map link, because no email or booking provider is configured and a control that appears to submit but cannot is prohibited by `PRODUCT.md`.

Five programs CureRays names publicly — Keep Cancer Away, Keep Arthritis Away, CureRays Institute, Clinical Outcomes, Join CureRays — are listed on `/about` but not linked. Stub routes would invent claims we have no copy for.

## Primary Navigation

The Mac-style command bar exposes:

- Patients
- Tasks
- Schedule
- Dashboard
- Analytics
- Settings

Persistent search supports patient, MRN, course, and action lookup within the PHI-safe product boundary. Account and theme controls remain available without competing with clinical actions.

## Page Responsibilities

### Patients

The authoritative patient registry for finding, creating, opening, and maintaining patient records. It is the normal entry point into a specific course.

### Tasks

The canonical cross-patient worklist for overdue, today, upcoming, assigned, blocked, review, signature, authorization, and treatment-exception work. Rows deep-link to the exact patient-workspace target; clinical completion remains inside the patient record.

### Schedule

Appointments, simulation, treatment fractions, follow-up, cancellations, and timing. Schedule state references patient/course workflow but does not independently advance it.

### Dashboard

Compact operational oversight: workload, blockers, pending review/signatures, schedule pressure, missing evidence, treatment progress, and recent exceptions. It is not a second patient workspace.

### Analytics

Aggregate operational reporting and bottleneck analysis using PHI-minimized data.

### Settings

Workflow definitions, template metadata, storage/integration configuration, users/roles/permissions, billing dictionaries, notifications, and security administration. Sensitive changes require real authorization and audit in production.

### Patient Workspace

The authoritative single-course work surface with four tabs:

1. Overview
2. Prepare
3. Treatment
4. Record & Closeout

See [patient workspace](patient-workspace.md).

## Route Inventory

This is the canonical route decision record. Other documents point here instead of maintaining their own route tables.

### Canonical pages

| Route | Responsibility |
|---|---|
| `/patients` | Patient registry (entry point) |
| `/patients/[id]` | Patient workspace, four tabs |
| `/tasks` | Canonical cross-patient worklist |
| `/schedule` | Schedule |
| `/dashboard` | Operational oversight |
| `/analytics` | Aggregate PHI-minimized reporting |
| `/settings`, `/settings/users`, `/settings/templates` | Administration |
| `/templates` | Template registry administration |
| `/audit-logs` | The single audit surface |
| `/users-roles` | User and role management |
| `/treatment-delivery/fraction-logs` | Cross-patient fraction-log review queue — kept because it answers a distinct clinic-wide question, subject to the deep-link contract |
| `/login`, `/error`, `/not-found` | Shell pages |

### Retired routes (redirects)

The following legacy routes redirect and must stay that way — no legacy page may maintain competing patient-course state:

- To `/patients`: `/courses`, `/clinical-forms`, `/imaging`, `/treatment-planning`, `/treatment-delivery`, `/documents`, `/billing`, `/audit`, `/records`, `/upcoming`, `/on-treatment`, `/post`
- To `/tasks`: `/workflow`, `/today`
- Patient deep-links: `/patients/[id]/carepath` → Prepare tab, `/patients/[id]/documents` → Record & Closeout tab

### Decided retirements (to be converted to redirects)

| Route | Decision | Reason |
|---|---|---|
| `/workflow/igsrt` | Redirect to `/patients` | Duplicates the workspace Treatment tab; cross-patient fraction review belongs in `/tasks` and `/treatment-delivery/fraction-logs` |
| `/workflow/templates` | Redirect to `/templates` | Duplicates the template registry page |
| `/reports` | Redirect to `/analytics` | Same telemetry as Analytics |
| `/security-logs` | Redirect to `/audit-logs` | Renders the same component over the same data; `/audit-logs` is the single audit surface |

## Deep-Link Contract

Global queues and alerts link to:

- patient opaque route ID;
- stable workspace tab;
- stable target kind and record ID.

PHI such as name, MRN, DOB, or diagnosis narrative must not be encoded in query strings.

## Responsive Behavior

- The command bar never covers content or modal actions.
- Desktop patient pages use persistent patient/course context.
- Narrow/short layouts preserve identity, course, gate, and tabs while collapsing secondary details.
- The page owns vertical scrolling; tables and wide clinical records may own contained horizontal scrolling.
- Navigation remains keyboard operable and understandable at browser zoom.
