# AGENTS.md — CureRays CRMS

## Architecture Overview

Next.js 14 App Router + React 18 + TypeScript + Tailwind CSS 3.
All data is mock data — no API calls at runtime. Prisma schema exists but is not queried by the UI.

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

## Component Architecture

### Directory Structure

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

## Common Pitfalls

- Don't use `min-h-screen` on the outer shell — use `h-screen overflow-hidden` with flex
- Don't forget `flex-1 min-h-0` on DataTable wrapper for proper height chain
- Don't mix Tailwind color classes with CSS token colors — pick one system (use tokens)
- Don't add comments to code unless explicitly asked
