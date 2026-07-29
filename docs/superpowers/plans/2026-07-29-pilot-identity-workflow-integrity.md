# Pilot Identity and Workflow Integrity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` to execute this plan task by task.

**Goal:** Replace header-trusted prototype identity with signed pilot sessions, enforce role boundaries on every protected route, and make workflow phase/step mutations consistent with linked tasks.

**Architecture:** Use one small server-only session module backed by environment-provided scrypt hashes and an HMAC cookie. Next.js `proxy.ts` provides the broad fail-closed boundary; route handlers and server data access still resolve the session and authorize the exact action. Extend the existing workflow transaction rather than adding a second mutation path.

**Tech Stack:** Next.js 16 Node proxy/runtime, Node `crypto`, HTTP-only cookies, existing in-memory/Prisma repositories, React 19.

## Global Constraints

- No credentials, session tokens, or PHI in logs, screenshots, client state, or committed fixtures.
- Do not trust browser-supplied actor/role headers or a development `RAD_ONC` fallback.
- Session cookie is HMAC-signed, HTTP-only, `SameSite=Lax`, path `/`, and expires after eight hours.
- Login errors are generic; cookie-authenticated mutations reject cross-origin requests.
- `PCP` remains read-only.
- Workflow step mutation roles: `VA`, `MA`, `RTT`, `NP_PA`, `RAD_ONC`, `PHYSICIST`, `ADMIN`.
- Course advance roles: `RAD_ONC`, `ADMIN`.
- Reuse the existing course workflow transaction and rollback/reload behavior.
- Landing-page integration is behavior and copy only; do not alter its visual composition.

---

## Task 1: Implement the signed pilot session boundary

**Files:**

- Create: `lib/server/pilot-session.ts`
- Create: `app/api/auth/login/route.ts`
- Create: `app/api/auth/logout/route.ts`
- Create: `app/api/auth/session/route.ts`
- Create: `proxy.ts`
- Create: `scripts/pilot-auth-check.mjs`
- Modify: `.env.example`
- Modify: `package.json`
- Delete after callers migrate: `lib/server/prototype-session.ts`

**Environment contract:**

```env
PILOT_ACCOUNTS_JSON=[{"id":"rad-onc-1","displayName":"Pilot Radiation Oncologist","role":"RAD_ONC","passwordHash":"scrypt$<salt-base64url>$<hash-base64url>"}]
PILOT_SESSION_SECRET=<at-least-32-random-characters>
```

**HTTP contract:**

- `POST /api/auth/login` body `{accountId,password}`; success `{session:{id,displayName,role,expiresAt}}`.
- `POST /api/auth/logout` success `{ok:true}` and expires the cookie.
- `GET /api/auth/session` success `{session}`; unauthenticated `401`.

- [ ] Create `pilot-auth-check.mjs` first with source/HTTP assertions for fail-closed configuration, generic errors, cookie flags, invalid signatures, expiry, and same-origin mutation protection; run it and record the expected failure.
- [ ] Implement account parsing, scrypt verification via `timingSafeEqual`, HMAC signing/verification, cookie serialization, named actor claims, and strict configuration validation using only Node/platform APIs.
- [ ] Add the three auth routes and `proxy.ts`; redirect protected page requests to `/login`, return JSON `401` for protected APIs, and exclude `/login`, `/api/auth/*`, Next assets, and files with extensions.
- [ ] Add a password-hash operator script that reads the password from an environment variable and prints only the scrypt hash.
- [ ] Document non-secret environment shapes in `.env.example`; do not add a fallback account.
- [ ] Run `node scripts/pilot-auth-check.mjs` and `npm run typecheck`.
- [ ] Commit with message `feat: add signed pilot session boundary`.

## Task 2: Migrate shell, login, API callers, and PHI access to named sessions

**Files:**

- Modify: `app/layout.tsx`
- Modify: `components/app-shell.tsx`
- Modify: `components/mac-navigation.tsx`
- Modify: `components/landing/login-card.tsx`
- Modify: `app/patients/[id]/page.tsx`
- Modify: every server caller returned by `rg -n "prototype-session|x-curerays-role|x-curerays-user|systemPhiAccess" app components lib`
- Modify: client callers returned by `rg -n "x-curerays-role|x-curerays-user" components`
- Modify: `scripts/pilot-auth-check.mjs`
- Delete: `lib/server/prototype-session.ts`

**Contracts:**

- Root layout resolves the server session once and passes only `{displayName,role}` to the shell.
- Logout uses the real route and returns to `/login`.
- Patient PHI access carries the authenticated actor identity and role; `systemPhiAccess` remains internal-only.

- [ ] Add failing source assertions that no client sends actor/role headers and no protected route imports the prototype session or uses `systemPhiAccess` for a browser request.
- [ ] Run the auth check and record the expected failure.
- [ ] Wire the existing login form to the login endpoint, preserve its layout, show a generic error, prevent duplicate submissions, and redirect authenticated users to `/dashboard`.
- [ ] Replace hardcoded shell identity with the server session and connect logout.
- [ ] Migrate all protected routes/services to the named session context and remove actor/role browser headers.
- [ ] Delete the obsolete prototype session module only after `rg` reports no callers.
- [ ] Run the auth check and `npm run typecheck`.
- [ ] Commit with message `refactor: use named pilot identity across the app`.

## Task 3: Split workflow authorization and add stale-safe phase advance

**Files:**

- Modify: `lib/rbac.ts`
- Modify: `lib/server/workflow-command-service.ts`
- Modify: `app/api/workflow/courses/[courseId]/advance/route.ts`
- Modify: `app/api/workflow/steps/[stepId]/route.ts`
- Modify: `scripts/phase3-workflow-engine.mjs`

**Request contract:**

```ts
interface AdvanceCourseRequest {
  expectedCoursePhase: CoursePhase;
  reason: string;
}
```

- A phase mismatch returns workflow status `STALE` and HTTP `409`.
- Empty reason returns `400`.
- Step mutation and course advance use separate permissions.

- [ ] Extend the phase-3 workflow check first with API assertions for allowed/denied roles, empty reasons, stale phase, and successful advance; run it and record the expected failure.
- [ ] Replace `workflow:mutate` with `workflow:step_mutate` and `workflow:advance` in the permission matrix.
- [ ] Pass `expectedCoursePhase` through the route/service, compare it before mutation, and map `STALE` to `409`.
- [ ] Keep existing blocker validation and mutation logging.
- [ ] Run `npm run test:phase3` and `npm run typecheck`.
- [ ] Commit with message `feat: enforce stale-safe course advancement`.

## Task 4: Synchronize workflow steps with exactly one linked task

**Files:**

- Modify: `lib/server/workflow-command-service.ts`
- Modify: `lib/clinical-store.ts`
- Modify: `lib/server/write-through.ts`
- Modify: `scripts/phase3-workflow-engine.mjs`

**Link contract:**

```ts
task.courseId === step.courseId &&
Number(task.taskNumber.match(/\d+$/)?.[0]) === step.stepNumber
```

- The numeric suffix preserves business identifiers such as `CP-08` and `IGSRT-01`; do not replace `taskNumber` with a fabricated identifier.
- Zero matches: mutate the workflow step only.
- One match: complete/sign/upload/close sets the task to `COMPLETED`; reopen sets it to `PENDING` and clears completion metadata.
- More than one match: return a configuration error without mutating either record.

- [ ] Extend the failing phase-3 check with zero/one/multiple-match cases and reopen behavior.
- [ ] Run it and record the expected failure.
- [ ] Resolve the linked task before any mutation and reject multiple matches.
- [ ] Mutate the step and linked task in memory as one operation; persist both within the existing course transaction and use the existing reload-on-failure path.
- [ ] Include the linked task result only when one task was synchronized.
- [ ] Run `npm run test:phase3` and `npm run typecheck`.
- [ ] Commit with message `fix: keep workflow steps and tasks consistent`.

## Task 5: Add the authenticated Advance Phase patient action

**Files:**

- Modify: `app/patients/[id]/page.tsx`
- Modify: `components/patients/patient-workspace.tsx`
- Modify: `scripts/phase3-workflow-engine.mjs`

**UI contract:**

- Show `Advance Phase` only to `RAD_ONC` and `ADMIN`.
- Modal displays current/next phase and current blockers, requires a reason, submits `expectedCoursePhase`, disables while pending, and refreshes the route on success.
- A `409` keeps the modal open and asks the user to refresh/review the changed course.

- [ ] Add a failing source assertion that the workspace sends `expectedCoursePhase` and handles `409`.
- [ ] Run the workflow check and record the expected failure.
- [ ] Pass a server-computed `canAdvanceCourse` boolean and the authenticated course phase into the client workspace.
- [ ] Implement the action with existing modal, button, form, and toast patterns.
- [ ] Run `npm run test:phase3` and `npm run typecheck`.
- [ ] Use the browser with mock data to verify allowed/denied roles, success, blockers, duplicate submission prevention, and stale conflict handling.
- [ ] Commit with message `feat: add patient course phase advancement`.
