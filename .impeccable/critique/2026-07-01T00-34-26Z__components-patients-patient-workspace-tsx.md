---
target: components/patients/patient-workspace.tsx
total_score: 18
p0_count: 0
p1_count: 4
timestamp: 2026-07-01T00-34-26Z
slug: components-patients-patient-workspace-tsx
---
# Patient Workspace Critique

Method: dual-agent (A: design_review · B: detector_evidence)

## Design Health Score

| # | Heuristic | Score | Key issue |
|---|---|---:|---|
| 1 | Visibility of system status | 2 | Phase and counts are visible, but readiness and approval states conflict. |
| 2 | Match system / real world | 2 | Domain language is credible; navigation follows software buckets rather than the course. |
| 3 | User control and freedom | 2 | Navigation exists, but undo, recovery, and direct task exits are incomplete. |
| 4 | Consistency and standards | 2 | Components are consistent while clinical states and typography diverge. |
| 5 | Error prevention | 1 | Impossible approval combinations and stale workflow steps can render. |
| 6 | Recognition rather than recall | 3 | Patient context is visible, but dependencies are split across tabs. |
| 7 | Flexibility and efficiency | 2 | Search and keyboard tabs help; expert shortcuts and batch work are absent. |
| 8 | Aesthetic and minimalist design | 2 | Duplicate facts, pills, borders, and dead space weaken focus. |
| 9 | Error recognition and recovery | 1 | No visible recovery or draft-preservation model. |
| 10 | Help and documentation | 1 | Acronyms and readiness calculations lack contextual explanation. |
| **Total** | | **18/40** | **Poor — major workflow and hierarchy redesign required.** |

## Anti-Patterns Verdict

The clinical content is credible, but the presentation has moderate AI-admin-dashboard characteristics: repeated bordered surfaces, tiny uppercase labels, colored pills for nearly every state, dense all-bold typography, and visual hierarchy driven by containers rather than task importance.

The deterministic detector returned `[]` with zero findings. This is not a contradiction: the primary failures are information architecture, state integrity, and clinical workflow hierarchy rather than detectable markup anti-patterns. Browser overlay injection was unavailable because the in-app browser backend was not available; supplied screenshots were used as the visual source.

## Overall Impression

The workspace shows a great deal of relevant information but does not reliably answer the operational question: what must this staff member do next, and is the patient safe to advance? Reorganizing the workspace around course stages and authoritative gates is more valuable than further styling the five current tabs.

## What Is Working

- Persistent patient/course context distinguishes CRMS reference from external MRN and preserves phase/fraction awareness.
- The selected-step Carepath panel demonstrates a useful focused workbench pattern.
- Tabs have semantic ARIA behavior and keyboard navigation; status uses text as well as color.

## Priority Issues

1. **[P1] Contradictory clinical state** — approval and schedule labels can disagree with required approvals or logged treatment. Centralize derived readiness and make impossible state combinations unrenderable.
2. **[P1] Storage-oriented information architecture** — Carepath, Documents, and Activity separate evidence from the clinical stage that needs it. Use Overview, Prepare, Treatment, and Record & Closeout.
3. **[P1] Inconsistent, undersized typography** — 11–12px muted text, mixed heading scales, and bold-everywhere styling raise scan effort. Adopt one semantic type scale with a 12px functional minimum.
4. **[P1] Generic action model** — repeated Review controls hide whether work requires completion, generation, signature, approval, upload, or blocker resolution. Use verb-specific actions with owner and due state.
5. **[P2] Width-heavy patient rail and duplicate summaries** — the full-height rail consumes workspace width and repeats action/signal facts. Replace it with a compact sticky patient/course header.

## Persona Red Flags

### Power user

- No direct route to the next actionable item or role-specific queue.
- Generic Review actions and cross-tab dependencies slow expert work.
- No batch or keyboard accelerator for repetitive review/sign/upload tasks.

### Accessibility-dependent user

- Dense 11–12px text and wide minimum-width tables are fragile at 200% zoom.
- Similar status pills make semantic differences difficult to scan.
- Save, generation, signing, and status changes have no visible announcement contract.

### Older clinical staff under time pressure

- DOT, OTV, eCW, Fx, and readiness terms lack nearby explanation.
- Dark, compact, all-bold presentation increases effort in bright treatment rooms.
- Conflicting approval/readiness states force manual rechecking and undermine trust.

## Minor Observations

- Documents & Billing does not expose a clear billing workflow.
- Activity displays raw timestamps and entity codes instead of an audit narrative.
- Overview silently truncates attention items after eight rows.
- Decorative background space dominates sparse tabs.
- Course snapshot headings and repeated next actions muddle hierarchy.

## Questions Considered

- The primary promise should be safe advancement and directed work, not showing every stored object.
- Navigation should follow the clinical lifecycle while documents and billing evidence stay contextual.
- Activity should support audit decisions inside the record rather than remain a top-level destination.
