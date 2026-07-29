# Operational Pilot Completion Design

**Status:** Design direction approved on 2026-07-29; written review pending

**Target viewport:** 1280 × 800 first, then wider desktop widths

**Product boundary:** Application-local clinical operations pilot using mock data only

## Outcome

Turn the current prototype into an honest, usable pilot workflow:

1. Dashboard becomes the daily operational command center.
2. Analytics becomes the only location for charts, trends, and aggregate analysis.
3. Core clinical work can advance, complete linked tasks, generate durable documents, and download them from Records & Closeout.
4. Pilot identity and authorization are server-owned instead of caller-supplied.
5. Laptop layouts fit a 1280 × 800 viewport without hidden navigation, accidental page nesting, or oversized tables.
6. Prototype-only controls never claim success when no real operation occurred.

The implementation reuses existing services, route handlers, shared components, design tokens, and document generators. It does not add a component library, chart system, state framework, or production identity provider.

## Coordination Boundary

Another agent is actively redesigning the landing page. This work must not edit:

- `app/login/page.tsx`
- `components/landing/`
- landing-page artwork or styles owned by that redesign

The pilot identity work will expose a stable server contract through `/api/auth/login`, `/api/auth/logout`, and `/api/auth/session`. The landing-page implementation can call that contract without controlling roles or account identity in the browser. The server contract may land without editing the landing page, but final pilot acceptance remains blocked until the landing-page owner integrates login, logout, and session handling. Protected-page redirects must not be enabled before that handoff is confirmed.

## Scope

### Included

- Dashboard and Analytics information architecture
- 1280 × 800 shell and patient-workspace layout corrections
- shared table and scroll containment corrections
- patient-course phase advancement from the active workspace
- linked workflow-step and task completion consistency
- durable DOCX/XLSX output storage and authorized download
- Records & Closeout lifecycle actions backed by real routes
- application-local pilot accounts and signed server sessions
- honest handling of unavailable prototype actions
- decided legacy-route redirects
- useful default task queue selection
- canonical pilot seed/reset and PHI-safe feedback runbook

### Excluded

- mobile layouts
- production IdP, SSO, MFA, account recovery, or self-service user administration
- real PHI, production credentials, or production integrations
- PDF/PPTX generation
- Google Drive or eClinicalWorks integration
- imaging binary storage
- deep predictive analytics or invented clinical scoring
- template-management expansion beyond the current registry
- landing-page visual design

## Information Architecture

### Dashboard: Daily Operations

The Dashboard is a single, tabless page. It answers: “What needs attention now?”

The page contains:

1. **Operational summary**
   - Appointments Today
   - Actionable Tasks
   - Blocked Work
   - Documents Awaiting Review

   Each value links to the relevant filtered workspace when a canonical target exists. Values are current counts only; trend deltas belong in Analytics.
   A metric without a canonical filtered destination is omitted.

2. **Priority Work Queue**
   - ordered by the existing task-priority service
   - shows priority, work item, due state, owner, and one direct action
   - defaults to the first non-empty useful bucket
   - uses PHI-safe identifiers in URLs

3. **Today’s Schedule**
   - compact list of the next appointments
   - links to the associated patient course when the appointment has a course identifier
   - renders non-linked appointment context honestly when no course is associated
   - does not recreate the full Schedule calendar

4. **Exceptions**
   - blocked workflow steps
   - overdue tasks
   - failed or pending document outputs
   - missing workflow configuration
   - every exception includes an actionable destination

At 1280 × 800, the summary row sits above a two-column body: Priority Work Queue on the left, with Today’s Schedule and Exceptions stacked on the right. The queue shows at most five rows, while each secondary card shows at most three rows followed by a canonical **View All** link. The first route viewport has no nested list scrolling or horizontal page overflow.

Dashboard removes:

- charts and trend graphs
- Overview, Care Path, and Risk tabs
- cohort and staffing analysis
- the synthetic Clinical Safety Score
- duplicated Analytics data builders
- decorative metrics without an operational destination

### Analytics: Trends and Aggregate Insight

Analytics remains the sole home for aggregate analysis. Its existing sections remain:

- Overview
- Workflow
- Treatment
- Documents
- Staffing
- Billing & Risk

Analytics may show trends, distributions, cohorts, comparisons, and aggregate risk indicators that are directly derived from the data. It must not invent a clinical safety score or imply a validated clinical model.

The existing “Date Range” control becomes **Trend Range** unless it filters every visible metric and table. Individual-patient work queues and daily action lists remain on Dashboard, Tasks, Schedule, or the patient workspace.

Existing section labels remain, but existing cards are reassessed. Analytics does not contain task queues, current-day action lists, per-course risk rankings, or direct clinical work actions.

At viewport widths up to 1320px, Analytics uses one chart per row. The insight summary is full-width, non-sticky, has no independent vertical scrollbar, and follows the active panel content in source order. Wider layouts may pair charts only when each chart card retains at least 480px of content width.

## 1280 × 800 Layout Contract

### Command Bar

At widths up to 1320px:

- the product identity, active navigation item, global search, account control, and theme control remain visible
- at 1280 × 800 and 100% zoom, those controls are unclipped, non-overlapping, and require no command-bar horizontal scroll
- inactive navigation items may collapse to icon-only controls with accessible names and tooltips
- the navigation strip must not silently scroll the brand or current page out of view
- horizontal scrolling is a last-resort overflow behavior, not the default 1280px layout

### Page Scroll Ownership

`AppShell` owns the fixed viewport. Dashboard, Analytics, Schedule, Settings, and patient workspaces use the route content container as their sole vertical scroller. On table-dominant routes, the `DataTable` body may instead be the sole vertical scroller within the remaining flex height. A route never exposes both.

Shared tables use the available flex height (`flex-1 min-h-0`). They do not reserve a fixed 920px body for twenty rows when the viewport is 800px high.

### Patient Workspace

The expanded patient workspace retains the two-column Prepare layout once the content container is at least 900px wide. At 1280 × 800 with patient navigation expanded, the patient sidebar, a 220–240px Prepare path rail, and the form remain visible side by side. The form may reflow internally, but the page has no horizontal overflow or nested full-height rail scrollbar. The same route is verified with patient navigation collapsed. Below the container threshold, the rail and form stack in source order.

Empty treatment workflow containers are omitted. Status indicators use text-bearing shared status primitives; color-only dots are not sufficient.

### Sticky Elements

Elements named or presented as sticky must use a real sticky offset below the command bar. If a section cannot remain within the available height, it stays in normal flow instead of creating an overlapping nested scroller.

## Functional Design

### Patient-Course Phase Advancement

The active patient workspace exposes an **Advance Phase** action backed by the existing course-advance route and workflow service.

Flow:

1. The client submits the displayed `expectedCoursePhase` and a change reason.
2. Server evaluates the current phase, required steps, linked tasks, and role.
3. A stale phase returns `409` with the current tokenized course state; terminal phase, validation, and persistence failures return distinct existing command statuses.
4. If blocked, the response returns structured blocker reasons without PHI-bearing logs.
5. The workspace presents the blocker list and leaves the phase unchanged.
6. If allowed, the existing compare-and-set guard advances the course once, records the named actor, and returns the changed tokenized course result.
7. The client calls `router.refresh()` and confirms the phase from canonical server data.

The action is unavailable to roles that cannot advance the course.

### Linked Step and Task Consistency

The existing task link convention is `(courseId, taskNumber = String(step.stepNumber))`.

- zero matching tasks means the step has no linked task and may mutate alone
- one matching task is synchronized with the step
- multiple matching tasks are a configuration error and block the mutation
- completing, signing, uploading, or closing a step completes the linked task unless that task is already in a completed terminal state
- reopening a step sets its linked task to `PENDING` and clears terminal timestamps and reasons

The in-memory mutation updates both records before returning. Prisma mode persists the course, workflow step, linked task, and audit event through the existing single course write-through transaction; a failed transaction reloads canonical database state. An injected persistence failure must not leave a durable partial update.

### Durable Document Output

The existing DOCX/XLSX generators remain the only renderers. A shared server service replaces the disconnected raw-download and preview-only render simulations:

1. Authorize the named actor and generated-document record.
2. Resolve the course, requirement, active pilot-approved template source, and permitted output format server-side.
3. Require saved structured data, course applicability, and required-field completion.
4. Generate the real DOCX or XLSX bytes.
5. Create a new immutable output identifier and an opaque, PHI-free storage filename.
6. Write bytes with create-only semantics beneath the configured generated-document storage root.
7. Persist the output version, `APP_STORAGE` key, status, format, rendered actor/time, and lifecycle event using the existing clinical-store and persistence path.
8. Return the output identifier and safe metadata, never the storage path.

`POST /api/documents/generate` becomes the only creation contract:

- form request: `{ kind: "form", courseId, requirementId }`
- fraction-log request: `{ kind: "fraction-log", courseId }`
- success response: `{ output: { id, documentId, format, version, status }, downloadUrl }`
- validation, authorization, unsupported-format, and persistence failures return field-safe 4xx/5xx responses

The clinical-form and fraction-log callers are migrated from raw GET anchors to this POST, await success, then open the returned authorized download URL. The lifecycle `render` action invokes the same shared service and returns its output metadata. The current GET-generation path and text-preview/`app-storage://` fake render behavior are removed.

The pilot artifact matrix is exact:

- mapped clinical forms generate DOCX
- the fraction log generates XLSX
- isodose remains a separately attested static attachment
- PDF and PPTX generation are unavailable

The pilot storage root is configured by `GENERATED_DOCUMENT_STORAGE_DIR` and defaults to a gitignored project-local directory. Every resolved read/write path is verified to remain inside that root. A failed write does not create a completed lifecycle record.

`GeneratedDocumentOutputPhi`, write-through, and hydration gain the existing lifecycle fields that currently cannot round-trip: storage provider/key, rendered actor, exported actor/time, locked actor/time, void actor/time/reason, and manual-edit exception actor/time/reason. Content type and safe download filename are derived from the stored format, document name, and version; local filesystem paths never enter client DTOs.

Metadata and its lifecycle event persist atomically. If byte creation succeeds and metadata persistence fails, the service deletes that newly created file using the same root-containment guard before returning failure. If an existing metadata row points to a missing file, Records & Closeout shows **Output Missing**, disables download, and provides the operator recovery instruction.

### Authorized Download

Records & Closeout displays real generated outputs and their lifecycle state. Each row carries its parent `documentId` for lifecycle actions and its version `outputId` for download. `GET /api/generated-document-outputs/[outputId]/download` is the only byte-download contract.

The download route:

- derives identity and role from the signed server session
- verifies access to the requested output
- resolves only the persisted server storage key
- rejects missing, invalid, or out-of-root paths
- sends the stored DOCX/XLSX bytes with a safe content type and filename
- invokes the existing lifecycle `read` authorization/audit action before returning the bytes

The client never supplies a filesystem path or role header.

### Records & Closeout Actions

Static rows are replaced by records from the generated-document service. Supported actions are shown only when the lifecycle allows them:

- Generate
- Review opens an existing stored artifact and never creates a placeholder output
- Sign & Lock uses the existing pilot lifecycle route and is explicitly not a production electronic signature
- Download
- Void Output uses the existing lifecycle route for roles with `document:void`

Unsupported output formats remain visibly unavailable and do not show a success dialog.

### Pilot Identity and Authorization

Pilot accounts are application-local and server-owned.

- `PILOT_ACCOUNTS_JSON` contains named account records with unique identifier, normalized login, display name, allowed role, and scrypt password hash.
- `PILOT_SESSION_SECRET` is at least 32 random bytes and signs the session cookie with HMAC using the Node standard library.
- the signed claim contains only account identifier, issued time, and expiry; role and display name are resolved from current server configuration on every request
- the cookie is HTTP-only, SameSite=Lax, Secure in production, and expires after eight hours
- login compares the submitted password to the configured scrypt hash using a timing-safe comparison
- session parsing validates signature, expiry, account identity, and current configured role
- malformed or duplicate account configuration, an unsupported role, or a missing session secret fails closed; there is no development `RAD_ONC` fallback
- login failures use one generic message and never log password values, password hashes, or session claims
- all application pages and APIs are protected except `/login`, `/api/auth/login`, `/api/auth/logout`, `/api/auth/session`, and required static assets
- API authorization derives the actor and role from the session; browser-supplied role and actor headers are ignored
- cookie-authenticated mutation routes reject cross-origin requests using the request Origin and Host
- document, fraction, workflow, task, and audit services record the real named actor from the session

The pilot role actions are explicit:

- workflow-step mutation: VA, MA, RTT, NP/PA, radiation oncologist, physicist, and administrator
- course advancement: radiation oncologist and administrator
- task mutation and document/fraction actions: the existing role matrix remains authoritative
- PCP remains read-only

The existing broad workflow grant is split so permission to update an owned step does not implicitly grant permission to advance a course. Every configured pilot role is verified for one allowed action and one denied action. Production SSO, MFA, password recovery, lockout infrastructure, and account administration remain explicit deployment requirements.

The shell account label reads from the authenticated session instead of the hardcoded demo clinician. Until the landing redesign is integrated, its only contract is to submit `{ login, password }` to `/api/auth/login` and handle the route’s field-safe error response.

### Honest Prototype Controls

`PrototypeActionButton` fails closed:

- route-backed flows use their real button/link and API instead of this wrapper
- any retained callback receives its typed modal input, returns an awaited `{ ok, message }` result, and shows a pending state
- success appears only after `{ ok: true }`
- a control without a callback is disabled or replaced with a direct navigation control
- a callback that only changes local presentation state does not qualify as a completed operation
- unused modal fields are removed

Existing call sites are reviewed before the shared behavior changes. Real route-backed operations replace the prototype wrapper where they already exist.

### Small Routing and Queue Corrections

The recorded legacy routes become permanent server redirects:

- `/workflow/igsrt` → `/patients`
- `/workflow/templates` → `/templates`
- `/reports` → `/analytics`
- `/security-logs` → `/audit-logs`

Internal links are updated to their canonical destination, and the redirect set is checked for loops. Untrusted query context on the retired workflow routes is discarded; patient-specific work must use the canonical patient workspace deep link.

When the Tasks route has no explicit bucket, it selects the first non-empty bucket in this order:

1. Overdue
2. Today
3. Upcoming
4. All Open

### Seed/Reset and Feedback

Pilot reset uses one canonical seed path derived from the current template registry and workflow definitions. It must not maintain a second hardcoded legacy template list or embedded development password. Reset covers both OPS/PHI pilot data and the configured generated-output directory; byte deletion uses the same resolved-root containment guard as document storage.

The operator runbook documents:

- required environment variables
- reset and start commands
- expected named pilot accounts and roles without passwords
- the exact verification path: reset → start in Prisma mode → sign in → open the seeded Dupuytren’s course → save a form → restart → generate → download the stored output
- recovery for a failed local document write

`docs/guides/pilot-feedback.md` defines intake and triage, and `docs/templates/pilot-feedback-entry.md` provides the entry format. The clinic names one human Pilot Coordinator and one access-controlled internal channel before staff pilot; Pilot Coordinator is an organizational owner, not a new application RBAC role. The template explicitly prohibits patient names, MRNs, screenshots containing identifiers, credentials, and generated clinical documents.

## Error Handling

- Trust-boundary validation returns field-safe 4xx responses.
- Authorization failures return 401 or 403 without revealing whether a patient, course, or output exists.
- Document generation and storage failures return a recoverable error and do not create a false completed output.
- Phase advancement returns explicit blocker codes and user-facing descriptions.
- UI mutations remain pending until the server confirms success.
- Errors shown in the browser contain no stack trace, storage path, database detail, credential material, or PHI-bearing log content.

## Data Boundaries

- OPS and PHI persistence remain separate.
- Patient identifiers are not added to OPS records or client-side telemetry.
- URLs use opaque patient, course, task, and output identifiers.
- Server components and protected route handlers obtain PHI only after authorization.
- Screenshots and browser verification use the repository’s mock data only.
- Generated pilot artifacts are local, gitignored, access-controlled files and are not a production record archive.

## Operational Decisions Outside Code

Implementation can proceed with configurable accounts and the existing approved registry, but final staff-pilot acceptance also requires:

- the clinic to populate the named pilot roster in `PILOT_ACCOUNTS_JSON`
- a clinical owner to record approval of the frozen Dupuytren’s/universal mappings and the documented static-attachment disposition
- the clinic to name the human Pilot Coordinator and access-controlled feedback channel
- the landing-page owner to confirm the auth-contract integration before protected-page redirects are enabled

## Verification

Verification stays proportional to active development:

1. Small runnable checks cover session signing/expiry/forgery, generated-output path containment, and the linked step/task transition.
2. An injected write-through failure confirms that the step/task pair cannot remain partially persisted.
3. `npm run verify` checks TypeScript, lint, typography, UI copy, and color rules.
4. A mock-data browser pass at 1280 × 800 verifies:
   - Dashboard
   - Analytics
   - Tasks
   - Schedule
   - Settings
   - patient Overview
   - patient Prepare with expanded and collapsed navigation
   - patient Treatment
   - Records & Closeout generation and download
5. Browser checks confirm no hidden active navigation, horizontal page overflow, nested full-page scrolling, false-success prototype actions, or real PHI.

Production builds, full guardrail suites, broad browser matrices, and release security validation remain deferred until the user declares release preparation.

## Implementation Sequence

Two independent tracks may run in parallel:

1. **Operational UI**
   - reduce Dashboard using existing operational projections
   - keep aggregate analysis in Analytics and correct laptop chart flow
   - correct shared shell, table, scroll, and patient Prepare behavior
2. **Pilot integrity**
   - add the server auth/session contract and remove caller-controlled identity
   - add phase advancement and linked-task synchronization only after server identity is enforced
   - join real document generation, immutable storage, lifecycle persistence, and authorized download
   - connect Records & Closeout to the real document flow
   - consolidate seed/reset and write the PHI-safe feedback runbook
3. Make prototype controls honest, update internal links, add permanent redirects, and correct the task fallback.
4. Complete the landing auth handoff without overwriting the landing redesign.
5. Run the proportional verification pass and capture final 1280 × 800 screenshots.

## Acceptance Criteria

- Dashboard has no charts, analysis tabs, or synthetic safety score.
- Dashboard’s visible cards, rows, and exception types lead to implemented operations or canonical filtered destinations.
- Analytics owns historical trends, distributions, cohorts, comparisons, matrices, and aggregate risk analysis. Dashboard contains current operational counts only.
- At 1280 × 800 and 100% zoom, the command bar shows unclipped product identity, active-navigation label, usable search, account, and theme controls with no horizontal scroll or overlap.
- At 1280 × 800 with patient navigation expanded, the patient sidebar, 220–240px Prepare rail, and form are visible side by side without horizontal overflow; the collapsed-navigation state also passes.
- A permitted user can complete required work and advance a course phase.
- Completing a linked workflow step cannot leave its task open.
- Reopening a linked workflow step reopens its task, while duplicate links fail without partial state.
- A permitted user can generate a real DOCX/XLSX, find its document/output identifiers in Records & Closeout, and download the stored bytes.
- Generated output version, storage key, status, format, and named rendered actor survive a Prisma-mode restart.
- Identity and roles come from a signed server session, not browser-supplied headers.
- Login, logout, expiry, forged-cookie rejection, and generic failure responses pass; client role headers cannot elevate permission.
- Cookie-authenticated cross-origin mutations are rejected.
- Each configured pilot role passes one allowed-action and one denied-action check.
- Controls without implemented operations cannot claim success.
- decided legacy routes redirect to their canonical pages.
- the default Tasks view is non-empty when any open bucket contains work.
- Reset/restart preserves the canonical workflow and populated requirement IDs while clearing generated pilot bytes safely.
- DOCX forms, XLSX fraction logs, and static isodose disposition match the exact pilot artifact matrix.
- feedback intake is canonical and PHI-safe, with the human owner and internal channel recorded before staff pilot.
- final integrated sign-in is required for pilot acceptance even though the landing-page visual implementation is owned by another agent.
