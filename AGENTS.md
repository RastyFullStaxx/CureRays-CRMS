# AGENTS.md — CureRays CRMS

## Project

Next.js 16 App Router + React 19 + TypeScript + Tailwind CSS 3.
A patient-course centered clinical operations system for CureRays Radiation Medicine. Mock-data-driven frontend prototype designed to replace manual Google Drive-based workflows.

## Quick Commands

```bash
npm run dev          # Start Next.js dev server
npm run build        # Production build (next build)
npm run start        # Start production server
npm run lint         # ESLint CLI (next/core-web-vitals + TypeScript)
npm run typecheck    # TypeScript type checking (tsc --noEmit)
npm run verify       # Fast prototype gate: typecheck + lint
npm run test:guardrails # Phase + HIPAA guardrail scripts
npm run test:full    # Full suite: verify + build + all guardrails
npm run test:hipaa   # HIPAA guardrails validation
```

## Testing

- No formal test framework is configured yet. Phase guardrail scripts in `scripts/` validate feature completeness for each phase.
- `npm run verify` is intentionally lightweight for prototype feature work and only runs `typecheck + lint`.
- `npm run test:guardrails` runs the phase scripts plus HIPAA boundaries. `npm run test:full` runs `verify + build + all guardrails`.
- Mock data in `lib/mock-data.ts` should be validated against TypeScript types in `lib/types.ts`.
- Prisma schemas exist but are not queried by the UI — all data is in-memory mock data.
- When adding a testing framework (Jest, Vitest, Playwright):
  - Service functions in `lib/services/` should have unit tests
  - Store mutations in `lib/clinical-store.ts` should have behavior tests
  - API route handlers in `app/api/` should have integration tests
  - Components should have React Testing Library tests for rendering with mock data

## Code Style

- **Must-read UI rules**: Before designing UI or writing UI code, read `docs/curerays-ui-engineering-rules.md`.
- **ESLint**: ESLint CLI with `eslint-config-next/core-web-vitals` and TypeScript rules. Run `npm run lint` before committing.
- **TypeScript**: Strict mode enabled in `tsconfig.json`. Prefer explicit types over inference. No `any`.
- **Prettier**: No config yet. Use consistent formatting (2 spaces, single quotes, trailing commas).
- **EditorConfig**: Use 2 spaces, UTF-8, LF line endings.
- **Naming**: Components `PascalCase`, files `kebab-case`, CSS tokens `--kebab-case`, named exports (except pages).

## Architecture

### Routes (App Router)

| Path | Type | Purpose |
|------|------|---------|
| `/` | Page | Landing/login page |
| `/dashboard` | Page | Command center / main dashboard |
| `/patients` | Page | Patient registry |
| `/patients/[id]/*` | Pages | Patient workspace, carepath, documents, fraction log |
| `/schedule` | Page | Schedule view |
| `/courses` | Page | Courses overview |
| `/analytics`, `/reports` | Pages | Analytics and reporting |
| `/billing` | Page | Billing/coding |
| `/clinical-forms` | Page | Clinical forms |
| `/documents` | Page | Document management |
| `/imaging` | Page | Imaging |
| `/on-treatment`, `/post` | Pages | Treatment status views |
| `/treatment-planning` | Page | Treatment planning |
| `/treatment-delivery` | Page | Treatment delivery |
| `/workflow/*` | Pages | Workflow engine (IGSRT, templates) |
| `/templates` | Pages | Template management |
| `/tasks` | Page | Task management |
| `/audit`, `/audit-logs`, `/security-logs` | Pages | Audit and security logs |
| `/settings/*` | Pages | Settings (users, templates) |
| `/users-roles` | Page | User and role management |
| `/api/workflow` | Route | Workflow API |
| `/api/igsrt` | Route | IGSRT API |
| `/api/patients` | Route | Patients list API |
| `/api/patients/[id]` | Route | Single patient API |
| `/api/generated-documents/[id]` | Route | Document API |

### Data Architecture (Two-Database)

| Database | Schema | Purpose |
|----------|--------|---------|
| **OPS** | `prisma/ops-schema.prisma` | Tokenized operational data — no patient identifiers |
| **PHI** | `prisma/phi-schema.prisma` | Protected health information — patient identifiers |

- The UI currently uses **mock data** from `lib/mock-data.ts`, not Prisma queries.
- The `lib/hipaa.ts` utility provides PHI redaction functions.
- Run `npm run test:hipaa` or `npm run test:guardrails` to validate PHI boundaries. These checks are preserved but are not part of the daily lightweight `verify` gate.

### Key Files

| Layer | Path | Purpose |
|-------|------|---------|
| Types | `lib/types.ts` | All TypeScript types, interfaces, enums (824 lines) |
| Mock data | `lib/mock-data.ts` | In-memory mock data store (856 lines) |
| Clinical store | `lib/clinical-store.ts` | Clinical data state & mutations (881 lines) |
| HIPAA utilities | `lib/hipaa.ts` | PHI redaction and safety utilities (166 lines) |
| Workflow | `lib/workflow.ts` | Workflow helpers |
| Template registry | `lib/template-registry.ts` | Template management |
| Dashboard data | `lib/dashboard-data.ts` | Dashboard data generation |
| Global page data | `lib/global-page-data.ts` | Cross-page data |
| Module data | `lib/module-data.ts` | Module-specific data |
| Page layout data | `lib/page-layout-data.ts` | Layout configuration |
| Services | `lib/services/` | Business logic services |
| Server utilities | `lib/server/` | Server-side code |
| Prisma OPS | `prisma/ops-schema.prisma` | OPS database schema |
| Prisma PHI | `prisma/phi-schema.prisma` | PHI database schema |

### Component Architecture

```
components/
├── ui/              # Atomic primitives (Card, Button, Input, Badge, etc.)
├── shared/          # Composite patterns (DataTable, FilterStrip, StatCard, PageHeader)
├── layout/          # AppShell, NavItem
├── dashboard/       # Dashboard-specific cards (simplified)
├── landing/         # Login page components
└── patients/        # Patient-specific workspace components
```

### Rules

1. **No component writes its own base UI** — always import from `components/ui/`
2. **All colors via CSS tokens** — never hardcoded hex in component files
3. **DataTable fills remaining height** via flex chain: `AppShell <main>` → `PageStack` → `DataTable` → scrollable body
4. **FilterStrip lives inside DataTable's toolbar slot** — not a separate floating bar
5. **StatCard + StatGrid** for all KPI/metric displays — consistent across all pages
6. **No right rail** — all content is full-width
7. **Sidebar is collapsible** — 240px ↔ 64px, persisted in localStorage
8. **No separate topbar** — user actions live in sidebar's pinned account row
9. **Clinical modals use the largest appropriate shared modal token** — avoid unnecessary scrolling by grouping fields into balanced sections before adding another internal scroll area
10. **Every scrollable UI uses the shared styled scrollbar** — apply `scrollbar-soft` or a shared class that maps to the same scrollbar tokens
11. **Status text uses shared pill primitives** — no ad hoc translucent rounded pills; use `Badge`, `StatusBadge`, or `clinical-pill` tone classes
12. **Long command pages must contain their own overflow** — schedule calendars, template registries, settings review lists, audit/security selected-event panels, and other table-heavy admin surfaces should use page-level `scrollbar-soft` plus self-starting grids/cards so detail panels never overlap adjacent tables or escape their containers
13. **Balance paired layouts to leave no dead gaps** — when a table sits beside a selected-detail/review card, or stacked tables share a row with summary panels, plan the heights together. Expand the useful region first, such as table viewport rows, review-note textareas, selected-detail bodies, or snapshot panels, and then rely on styled scrolling for overflow so adjacent containers visually align instead of leaving large empty gaps or uneven bottoms.

### Page Pattern

```tsx
import { PageStack } from '@/components/shared/page-stack';
import { PageHeader } from '@/components/shared/page-header';
import { StatGrid } from '@/components/shared/stat-grid';
import { StatCard } from '@/components/shared/stat-card';
import { DataTable } from '@/components/shared/data-table';
import { FilterStrip } from '@/components/shared/filter-strip';

export default function MyPage() {
  return (
    <PageStack>
      <PageHeader title="Page Title" subtitle="Description" actions={<Button>Action</Button>} />
      <StatGrid>
        <StatCard icon={...} label="Metric" value="123" />
      </StatGrid>
      <DataTable
        columns={[...]}
        rows={[...]}
        toolbar={<FilterStrip><Input placeholder="Search..." /></FilterStrip>}
      />
    </PageStack>
  );
}
```

### Client vs Server Components

- **Server components by default** — use for data fetching and static rendering
- **Client components** (`'use client'`) — only when interactivity (hooks, event handlers, browser APIs) is required
- Data fetching should happen in server components or route handlers, not in client `useEffect`
- Move `'use client'` as deep in the tree as possible

## Design Token System

**All styling uses CSS custom properties defined in `app/globals.css`.**

Never hardcode hex values in components. Always reference tokens:

```tsx
// CORRECT
<div className="bg-[var(--color-card)]" style={{ border: 'var(--border-container)' }}>

// WRONG
<div className="bg-white" style={{ border: '1px solid #D8E4F5' }}>
```

### Token Reference

| Token | Value | Usage |
|---|---|---|
| `--color-primary` | `#0033A0` | Brand blue, active states, primary buttons |
| `--color-primary-dark` | `#002080` | Hover state for primary |
| `--color-accent` | `#FF671F` | CureRays orange accent |
| `--color-bg` | `#F7F8FA` | Page background |
| `--color-card` | `#FFFFFF` | Card/surface background |
| `--color-text` | `#0B1220` | Primary text |
| `--color-text-muted` | `#667085` | Labels, captions, secondary text |
| `--color-border` | `#DDE3EA` | Container borders |
| `--color-border-soft` | `#EEF2F6` | Table dividers, subtle separators |
| `--color-hover` | `rgba(0,0,0,0.04)` | Hover surface tint |
| `--color-success` | `#22C55E` | Success states |
| `--color-warning` | `#F59E0B` | Warning states |
| `--color-error` | `#EF4444` | Error states |
| `--color-info` | `#3B82F6` | Info states |
| `--font-heading` | `Manrope` | All headings, stat values |
| `--font-body` | `Inter` | All body text, labels, inputs |
| `--space-page` | `clamp(16px, 1.7vw, 28px)` | Outer page gutter |
| `--space-card` | `20px` | Card internal padding |
| `--space-section` | `16px` | Vertical gap between sections |
| `--radius-md` | `8px` | Buttons, inputs, nav items |
| `--radius-lg` | `8px` | Cards, modals |
| `--width-sidebar` | `240px` | Expanded sidebar |
| `--width-sidebar-collapsed` | `64px` | Collapsed sidebar |
| `--height-header` | `56px` | Header/account row height |
| `--height-table-row` | `44px` | DataTable row height |
| `--height-table-header` | `40px` | DataTable header height |
| `--shadow-card` | 4-layer black | All card shadows |

## Typography

- **Headings**: Manrope, font-weight 800 (via `--font-weight-bold`)
- **Body**: Inter, font-weight 400-600
- **Stat values**: Manrope, 21px, bold
- **Labels**: Inter, 11px, uppercase, bold
- **Small text**: Inter, 13px

## Naming Conventions

- Components: `PascalCase` (e.g., `StatCard`, `FilterStrip`)
- Files: `kebab-case` (e.g., `stat-card.tsx`, `filter-strip.tsx`)
- CSS tokens: `--kebab-case` (e.g., `--color-primary`, `--space-card`)
- Exports: Named exports preferred over default exports (except page components)

## Deployment

- Built with `npm run build` (Next.js static generation + server components).
- Environment variables are documented in `.env.example`:
  - `DATABASE_URL_OPS` — OPS PostgreSQL connection string
  - `DATABASE_URL_PHI` — PHI PostgreSQL connection string
- Prisma migrations should be run with `npx prisma migrate deploy` in production.
- HIPAA guardrails must pass before deployment.

## Security & HIPAA

- PHI must NEVER appear in client bundles. Verify patient identifiers are not imported in client components.
- API routes serving PHI must have server-side authorization checks.
- Error messages must not leak PHI, stack traces, or database structure.
- The OPS and PHI databases must remain separate — no cross-database queries.
- `lib/hipaa.ts` provides redaction utilities — use them for all logging and error handling.
- Mock data contains simulated PHI — review client components for accidental exposure.
- The `hipaa-guardrails.mjs` script validates PHI boundaries automatically.

## Environment

- Node.js 20.19+ required by the current Next.js/ESLint stack. Use the repo Node version files when available. npm 9+.
- No database required for local development — all data is in-memory mock data.
- PostgreSQL required only when connecting Prisma to real databases.
- `.env.example` has all keys — copy to `.env` and fill for local work if needed.

## Common Pitfalls

- Don't use `min-h-screen` on the outer shell — use `h-screen overflow-hidden` with flex
- Don't forget `flex-1 min-h-0` on DataTable wrapper for proper height chain
- Don't let long admin/detail panels rely on the fixed AppShell viewport alone — add explicit soft-scroll regions, `min-w-0`, and `self-start` containment where tables sit beside review cards
- Don't mix Tailwind color classes with CSS token colors — pick one system (use tokens)
- Don't add comments to code unless explicitly asked
- Don't add `'use client'` unless the component actually needs browser APIs, hooks, or event handlers
- Don't hardcode hex colors — always use `var(--color-*)` CSS custom properties
- Don't import icons from lucide-react directly in page components — use a shared component or wrapper
- Don't use relative imports that traverse many levels (`../../../`) — use `@/` path alias
- Don't put business logic in page components — extract to `lib/services/` or `lib/clinical-store.ts`
- Don't expose PHI in client component props, state, or rendered HTML
- Don't forget to update `lib/types.ts` when adding new mock data shapes
- Don't delete code that "looks unused" without verifying references through imports, route usage, and component usage
