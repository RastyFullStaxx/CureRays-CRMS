import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const require = createRequire(import.meta.url);
const Module = require("node:module");
const ts = require("typescript");
const read = (path) => readFileSync(join(root, path), "utf8");

function assertIncludes(source, expected, message) {
  assert.ok(source.includes(expected), message);
}

function assertExcludes(source, forbidden, message) {
  assert.equal(source.includes(forbidden), false, message);
}

function installTsHook() {
  const originalResolve = Module._resolveFilename;
  const originalLoad = Module._load;

  Module._load = function load(request, parent, isMain) {
    return request === "server-only" ? {} : originalLoad.call(this, request, parent, isMain);
  };

  Module._resolveFilename = function resolve(request, parent, isMain, options) {
    if (request.startsWith("@/")) {
      const mapped = join(root, request.slice(2));
      for (const candidate of [mapped, `${mapped}.ts`, `${mapped}.tsx`, `${mapped}.json`, join(mapped, "index.ts")]) {
        if (existsSync(candidate)) return candidate;
      }
    }
    return originalResolve.call(this, request, parent, isMain, options);
  };

  for (const extension of [".ts", ".tsx"]) {
    Module._extensions[extension] = function compile(module, filename) {
      const output = ts.transpileModule(readFileSync(filename, "utf8"), {
        compilerOptions: {
          esModuleInterop: true,
          jsx: ts.JsxEmit.ReactJSX,
          module: ts.ModuleKind.CommonJS,
          resolveJsonModule: true,
          target: ts.ScriptTarget.ES2020
        },
        fileName: filename
      });
      module._compile(output.outputText, filename);
    };
  }
}

const servicePath = "lib/server/workflow-command-service.ts";
const workflowRoutePath = "app/api/workflow/route.ts";
const taskRoutePath = "app/api/tasks/route.ts";
const taskMutationRoutePath = "app/api/tasks/[taskId]/route.ts";
const stepMutationRoutePath = "app/api/workflow/steps/[stepId]/route.ts";
const advanceRoutePath = "app/api/workflow/courses/[courseId]/advance/route.ts";
const clinicalFormRoutePath = "app/api/clinical-forms/route.ts";
const patientPagePath = "app/patients/[id]/page.tsx";
const patientWorkspacePath = "components/patients/patient-workspace.tsx";
const typesSource = read("lib/types.ts");
const rbacSource = read("lib/rbac.ts");
const clinicalStoreSource = read("lib/clinical-store.ts");
const packageJson = read("package.json");

for (const path of [servicePath, workflowRoutePath, taskRoutePath, taskMutationRoutePath, stepMutationRoutePath, advanceRoutePath]) {
  assert.ok(existsSync(join(root, path)), `${path} must exist`);
}

for (const expected of [
  'import "server-only"',
  "export type WorkflowTaskRepository",
  "export const inMemoryWorkflowTaskRepository",
  "export const prismaWorkflowTaskRepository",
  "selectWorkflowTaskRepository",
  "advanceCourseWorkflow",
  "updateWorkflowStepCommand",
  "updateTaskCommand",
  "workflowDueDateIsOverdue",
  "Workflow advancement blocked",
  "Workflow/task commands return tokenized"
]) {
  assertIncludes(read(servicePath), expected, `${servicePath} must include ${expected}`);
}

for (const expected of [
  "WorkflowQueueName",
  "WorkflowAdvanceInput",
  "WorkflowStepMutationInput",
  "TaskMutationInput",
  "OperationalWorkflowStep",
  "OperationalTask",
  "WorkflowQueueSnapshot",
  "WorkflowStepApplicability"
]) {
  assertIncludes(typesSource, expected, `Phase 3 type contract must include ${expected}`);
}

for (const expected of ["workflow:step_mutate", "workflow:advance", "task:mutate"]) {
  assertIncludes(rbacSource, expected, `RBAC must include ${expected}`);
}
assertExcludes(rbacSource, '"workflow:mutate"', "RBAC must not retain the broad workflow mutation permission");

for (const expected of [
  "removedCarepathReason",
  "optionalCarepathReason",
  "calculateWorkflowDueDate",
  "ensureCourseWorkflowSteps",
  "requirementIdsForStep",
  "recordOperationalAuditEvent"
]) {
  assertIncludes(clinicalStoreSource, expected, `clinical store must include ${expected}`);
}

assertIncludes(read(workflowRoutePath), "listWorkflowCommandSnapshot", "Workflow GET must use command snapshot");
assertIncludes(read(taskRoutePath), "listTaskQueue", "Task GET must use queue service");
assertIncludes(read(taskMutationRoutePath), "updateTaskCommand", "Task mutation route must use command service");
assertIncludes(read(stepMutationRoutePath), "updateWorkflowStepCommand", "Step mutation route must use command service");
assertIncludes(read(advanceRoutePath), "advanceCourseWorkflow", "Advance route must use command service");
assertIncludes(read(stepMutationRoutePath), '"workflow:step_mutate"', "Step mutation route must require step mutation access");
assertIncludes(read(advanceRoutePath), '"workflow:advance"', "Advance route must require course advance access");
assertIncludes(read(clinicalFormRoutePath), '"workflow:step_mutate"', "Clinical form mutation must use the workflow step mutation permission");
assertExcludes(read(workflowRoutePath), "@/lib/clinical-store", "Workflow route must not import clinical-store directly");
assertIncludes(read(patientWorkspacePath), "expectedCoursePhase: coursePhase", "Patient workspace must send the authenticated current course phase");
assertIncludes(read(patientWorkspacePath), "response.status === 409", "Patient workspace must handle stale course conflicts explicitly");
assertIncludes(read(patientWorkspacePath), "if (advancePending) return", "Patient workspace must prevent duplicate phase advancement submissions");
assertIncludes(read(patientPagePath), "roleCan(session.role, 'workflow:advance')", "Patient page must compute course advancement access from the signed session");
assertIncludes(read(patientPagePath), "canAdvanceCourse={canAdvanceCourse}", "Patient page must pass the server-computed course advancement gate");
assertIncludes(read(patientPagePath), "coursePhase={coursePhase}", "Patient page must pass the authenticated current course phase");
assertIncludes(packageJson, '"test:phase3"', "package.json must expose Phase 3 guardrail");
assertIncludes(packageJson, "npm run test:phase3", "npm run verify must include Phase 3 guardrail");

installTsHook();

const workflowService = require(join(root, servicePath));
const patientService = require(join(root, "lib/server/patient-registration-service.ts"));
const store = require(join(root, "lib/clinical-store.ts"));
const { roleCan } = require(join(root, "lib/rbac.ts"));
const { NextRequest } = require("next/server");
const { POST: advanceCourseRoute } = require(join(root, advanceRoutePath));
const {
  createPilotSession,
  PILOT_SESSION_COOKIE
} = require(join(root, "lib/server/pilot-session.ts"));

function mutationContext(action, reason, role = "RAD_ONC") {
  return {
    action,
    role,
    userId: `PHASE3-${role}`,
    userName: `Phase 3 ${role}`,
    sessionId: "phase3-session",
    ipAddress: "phase3-ip",
    deviceId: "phase3-device",
    reason
  };
}

function registrationInput(suffix) {
  return {
    firstName: `Phase3${suffix}`,
    lastName: "Workflow",
    mrn: `PHASE3-${suffix}`,
    diagnosis: "Future right cheek skin cancer",
    diagnosisCategory: "SKIN_CANCER",
    location: "Main Campus",
    physician: "Dr. Phase Three",
    assignedStaff: "RAD_ONC",
    chartRoundsPhase: "UPCOMING",
    status: "ACTIVE",
    nextAction: "Initialize workflow engine",
    notes: "Phase 3 workflow guardrail fixture.",
    initialCourse: {
      protocol: "IGSRT",
      bodyRegion: "SITE",
      laterality: "RIGHT",
      treatmentModality: "IGSRT",
      totalFractions: 20,
      startDate: "2027-01-20"
    }
  };
}

assert.ok(store.patientCourseWorkflowSteps.length > 0, "Seeded courses should have persisted workflow step rows");
const removedStep = store.patientCourseWorkflowSteps.find((step) => step.stepNumber === 3);
assert.equal(removedStep?.status, "NOT_APPLICABLE", "Removed Carepath steps should be initialized N/A");
assert.ok(removedStep?.naReason, "Removed Carepath steps should carry a system N/A reason");

assert.equal(workflowService.workflowDueDateIsOverdue("2026-01-01", "2026-06-12T00:00:00.000Z"), true, "Past due date should derive overdue");
assert.equal(workflowService.workflowDueDateIsOverdue("2027-01-01", "2026-06-12T00:00:00.000Z"), false, "Future due date should not derive overdue");

const overdueQueue = await workflowService.getTaskQueueSnapshot("ALL", "OVERDUE");
const todayQueue = await workflowService.getTaskQueueSnapshot("ALL", "TODAY");
const upcomingQueue = await workflowService.getTaskQueueSnapshot("ALL", "UPCOMING");
const allOpenQueue = await workflowService.getTaskQueueSnapshot("ALL", "ALL_OPEN");
assert.ok(overdueQueue.tasks.length > 0, "Task worklist should expose overdue fixtures");
assert.ok(todayQueue.tasks.length > 0, "Task worklist should expose today fixtures");
assert.ok(upcomingQueue.tasks.length > 0, "Task worklist should expose upcoming fixtures");
assert.equal(workflowService.taskMatchesDueBucket({ status: "PENDING" }, "ALL_OPEN"), true, "All Open should retain tasks without a due date");
assert.equal(workflowService.taskMatchesDueBucket({ status: "PENDING" }, "TODAY"), false, "Undated tasks should not appear in a dated bucket");
assert.equal(workflowService.taskMatchesDueBucket({ status: "PENDING", dueDate: "Before treatment start" }, "UPCOMING"), false, "Policy timing text must not be treated as a date");
assert.equal(allOpenQueue.tasks.some((task) => ["COMPLETED", "SIGNED", "CLOSED", "NOT_APPLICABLE"].includes(task.status)), false, "All Open must exclude completed work");
assert.ok(allOpenQueue.tasks.every((task) => task.workspaceTarget?.targetId), "Every seeded worklist task should resolve an exact workspace target");
assert.equal(allOpenQueue.tasks.find((task) => task.workspaceTarget?.targetId === "WF-COURSE-2401-8")?.workspaceTarget?.tab, "treatment", "On-treatment work should open the Treatment workspace");
assert.equal(allOpenQueue.tasks.find((task) => task.workspaceTarget?.targetId === "WF-COURSE-2405-13")?.workspaceTarget?.tab, "record-closeout", "Post-treatment work should open the Record and Closeout workspace");
assert.equal(overdueQueue.bucketCounts.ALL_OPEN, allOpenQueue.tasks.length, "Bucket counts should reconcile with All Open");

const createContext = {
  action: "phi:create",
  role: "RAD_ONC",
  userId: "PHASE3-RAD_ONC",
  userName: "Phase 3 RAD_ONC",
  sessionId: "phase3-session",
  ipAddress: "phase3-ip",
  deviceId: "phase3-device",
  reason: "Phase 3 create workflow bundle"
};
const created = await patientService.registerPatient(registrationInput(Date.now()), createContext);
assert.equal(created.ok, true, "Phase 3 registration fixture should create");
assert.equal(created.body.bundle.workflowDefinitionId, "WF-SKIN-IGSRT", "Workflow definition should be selected from course fields");

const course = store.treatmentCourses.find((item) => item.id === created.body.course.id);
assert.ok(course, "Created course should be available in store");
const courseSteps = store.patientCourseWorkflowSteps.filter((step) => step.courseId === course.id);
const courseTasks = store.carepathTasks.filter((task) => task.courseId === course.id);
assert.ok(courseSteps.length >= 15, "Course bundle should include workflow steps");
assert.ok(courseTasks.length >= 1, "Course bundle should include generated task rows");
assert.ok(courseSteps.some((step) => step.requirementIds?.length > 0), "Workflow steps should carry linked requirement ids");
assert.equal(store.calculateWorkflowDueDate("PLANNING", course), "2027-01-18", "Planning due date should be start minus two days");

const blockedAdvance = workflowService.evaluateWorkflowCommand(course.id);
assert.equal(blockedAdvance.allowed, false, "New course should not advance with incomplete current requirements");
assert.ok(blockedAdvance.blockers.some((blocker) => blocker.includes("must be completed")), "Advancement blockers should name incomplete work");

const requiredNa = workflowService.markWorkflowStepNotApplicable(courseSteps.find((step) => step.stepNumber === 0).id, "Trying to bypass");
assert.equal(requiredNa.allowed, false, "Required workflow steps must not be marked N/A");

const optionalBlankNa = workflowService.markWorkflowStepNotApplicable(courseSteps.find((step) => step.stepNumber === 6).id, "");
assert.equal(optionalBlankNa.allowed, false, "Optional N/A command should require a reason");

const roles = ["VA", "MA", "RTT", "NP_PA", "PCP", "RAD_ONC", "PHYSICIST", "BILLING", "ADMIN"];
const stepMutationRoles = new Set(["VA", "MA", "RTT", "NP_PA", "RAD_ONC", "PHYSICIST", "ADMIN"]);
const advanceRoles = new Set(["RAD_ONC", "ADMIN"]);
for (const role of roles) {
  assert.equal(roleCan(role, "workflow:step_mutate"), stepMutationRoles.has(role), `${role} step mutation permission must match the pilot matrix`);
  assert.equal(roleCan(role, "workflow:advance"), advanceRoles.has(role), `${role} advance permission must match the pilot matrix`);
}
assert.equal(roleCan("PCP", "workflow:step_mutate"), false, "PCP must remain read-only for workflow steps");
assert.equal(roleCan("PCP", "workflow:advance"), false, "PCP must remain read-only for course advancement");

const workflowContext = mutationContext("workflow:step_mutate", "Phase 3 complete consultation step");
const taskContext = mutationContext("task:mutate", "Phase 3 complete consultation task");
const consultationStep = courseSteps.find((step) => step.stepNumber === 0);
const deniedStep = await workflowService.updateWorkflowStepCommand(
  consultationStep.id,
  {
    status: "COMPLETED",
    expectedUpdatedAt: consultationStep.updatedAt,
    changeReason: "PCP must not mutate a workflow step."
  },
  mutationContext("workflow:step_mutate", "PCP must not mutate a workflow step.", "PCP")
);
assert.equal(deniedStep.ok, false, "PCP workflow step mutation must be denied");
assert.equal(consultationStep.status, "PENDING", "Denied workflow step mutation must not change state");

const stepUpdate = await workflowService.updateWorkflowStepCommand(
  consultationStep.id,
  {
    status: "COMPLETED",
    expectedUpdatedAt: consultationStep.updatedAt,
    changeReason: "Phase 3 guardrail completed current step."
  },
  workflowContext,
  "2026-06-12T00:00:00.000Z"
);
assert.equal(stepUpdate.ok, true, "Completing consultation step should succeed");
assert.equal(stepUpdate.body.auditEvent.redacted, true, "Workflow step audit event should be redacted");
assert.equal(stepUpdate.body.task, undefined, "A step without a matching task should return only the canonical step");

const linkedStep = courseSteps.find((step) => step.stepNumber === 5);
const linkedTask = {
  ...structuredClone(courseTasks[0]),
  id: `${courseTasks[0].id}-LINKED-05`,
  courseId: course.id,
  taskNumber: "IGSRT-05",
  status: "PENDING",
  auditReady: false,
  completedAt: undefined,
  signedAt: undefined,
  blockedReason: undefined,
  naReason: undefined,
  reopenReason: undefined
};
store.carepathTasks.push(linkedTask);
const linkedTaskNumber = linkedTask.taskNumber;
const linkedStepUpdate = await workflowService.updateWorkflowStepCommand(
  linkedStep.id,
  {
    status: "COMPLETED",
    expectedUpdatedAt: linkedStep.updatedAt,
    changeReason: "Phase 3 guardrail completed a linked workflow step."
  },
  workflowContext,
  "2026-06-12T00:00:00.000Z"
);
assert.equal(linkedStepUpdate.ok, true, "Completing a linked workflow step should succeed");
assert.ok(linkedStepUpdate.body.task, "Completing a linked step should return its synchronized task");
assert.equal(linkedStepUpdate.body.task.status, "COMPLETED", "Completing a linked step should complete its task");
assert.equal(linkedStepUpdate.body.task.taskNumber, linkedTaskNumber, "Linked task synchronization must preserve its business identifier");
assert.equal(linkedStepUpdate.body.auditEvent.userName, "Phase 3 RAD_ONC", "Linked step audit must preserve the named actor");

linkedTask.signedAt = "2026-06-12T00:00:00.000Z";
linkedTask.blockedReason = "Synthetic blocked reason";
linkedTask.naReason = "Synthetic N/A reason";
linkedTask.reopenReason = "Synthetic previous reopen reason";
const reopenedLinkedStep = await workflowService.updateWorkflowStepCommand(
  linkedStep.id,
  {
    status: "COMPLETED",
    reopenReason: "Phase 3 guardrail reopened a linked workflow step.",
    expectedUpdatedAt: linkedStepUpdate.body.step.updatedAt,
    changeReason: "Phase 3 guardrail reopened a linked workflow step."
  },
  workflowContext,
  "2026-06-12T00:00:00.000Z"
);
assert.equal(reopenedLinkedStep.ok, true, "Reopening a linked workflow step should succeed");
assert.equal(reopenedLinkedStep.body.step.status, "PENDING", "Reopen reason should take precedence over a stale terminal status");
assert.equal(reopenedLinkedStep.body.task.status, "PENDING", "Reopening a linked step should return its task to pending");
for (const field of ["completedAt", "signedAt", "blockedReason", "naReason", "reopenReason"]) {
  assert.equal(reopenedLinkedStep.body.task[field], undefined, `Reopening a linked step should clear task ${field}`);
}
assert.equal(reopenedLinkedStep.body.task.taskNumber, linkedTaskNumber, "Reopening must preserve the linked task business identifier");

linkedTask.status = "NOT_APPLICABLE";
linkedTask.auditReady = true;
linkedTask.completedAt = "2026-06-11T00:00:00.000Z";
linkedTask.signedAt = "2026-06-11T00:00:00.000Z";
linkedTask.blockedReason = "Synthetic stale blocker";
linkedTask.naReason = "Synthetic stale N/A reason";
linkedTask.reopenReason = "Synthetic stale reopen reason";
const terminalLinkedStep = await workflowService.updateWorkflowStepCommand(
  linkedStep.id,
  {
    status: "CLOSED",
    expectedUpdatedAt: reopenedLinkedStep.body.step.updatedAt,
    changeReason: "Phase 3 guardrail normalized a terminal linked task."
  },
  workflowContext,
  "2026-06-12T00:00:00.000Z"
);
assert.equal(terminalLinkedStep.ok, true, "Closing a step with an already-terminal linked task should succeed");
assert.equal(terminalLinkedStep.body.task.status, "COMPLETED", "Terminal step actions must normalize a linked task to completed");
assert.notEqual(terminalLinkedStep.body.task.completedAt, "2026-06-11T00:00:00.000Z", "Terminal task normalization must refresh completion time");
for (const field of ["signedAt", "blockedReason", "naReason", "reopenReason"]) {
  assert.equal(terminalLinkedStep.body.task[field], undefined, `Terminal task normalization should clear stale ${field}`);
}
store.carepathTasks.splice(store.carepathTasks.indexOf(linkedTask), 1);

const duplicateStep = courseSteps.find((step) => step.stepNumber === 6);
const duplicateTask = {
  ...structuredClone(courseTasks[0]),
  id: `${courseTasks[0].id}-LINKED-06`,
  courseId: course.id,
  taskNumber: "CP-06",
  status: "PENDING",
  auditReady: false,
  completedAt: undefined,
  signedAt: undefined
};
const conflictingTask = {
  ...structuredClone(duplicateTask),
  id: `${duplicateTask.id}-DUPLICATE`,
  taskNumber: "CUSTOM-06"
};
store.carepathTasks.push(duplicateTask, conflictingTask);
const duplicateStepBefore = structuredClone(duplicateStep);
const duplicateTaskBefore = structuredClone(duplicateTask);
const conflictingTaskBefore = structuredClone(conflictingTask);
const auditCountBeforeDuplicate = store.auditEvents.length;
const duplicateResult = await workflowService.updateWorkflowStepCommand(
  duplicateStep.id,
  {
    status: "COMPLETED",
    expectedUpdatedAt: duplicateStep.updatedAt,
    changeReason: "Reject ambiguous linked task configuration."
  },
  workflowContext,
  "2026-06-12T00:00:00.000Z"
);
assert.equal(duplicateResult.ok, false, "Multiple linked tasks should reject the workflow step mutation");
assert.ok(
  duplicateResult.body.blockers.some((blocker) => blocker.includes("Multiple carepath tasks")),
  "Multiple linked tasks should return a configuration blocker"
);
assert.deepEqual(duplicateStep, duplicateStepBefore, "Duplicate-link failure must leave the workflow step unchanged");
assert.deepEqual(duplicateTask, duplicateTaskBefore, "Duplicate-link failure must leave the original task unchanged");
assert.deepEqual(conflictingTask, conflictingTaskBefore, "Duplicate-link failure must leave the conflicting task unchanged");
assert.equal(store.auditEvents.length, auditCountBeforeDuplicate, "Duplicate-link failure must not record a mutation audit");
store.carepathTasks.splice(store.carepathTasks.indexOf(duplicateTask), 2);

for (const task of courseTasks.filter((item) => item.workflowPhase === "CONSULTATION")) {
  const taskUpdate = await workflowService.updateTaskCommand(
    task.id,
    {
      status: "COMPLETED",
      expectedLastUpdatedAt: task.lastUpdatedAt,
      changeReason: "Phase 3 guardrail completed current task."
    },
    taskContext,
    "2026-06-12T00:00:00.000Z"
  );
  assert.equal(taskUpdate.ok, true, `${task.id} should complete`);
}

const pilotSalt = Buffer.from(Array.from({ length: 16 }, (_, index) => index + 1)).toString("base64url");
const pilotHash = Buffer.from(Array.from({ length: 64 }, (_, index) => index)).toString("base64url");
const pilotPasswordHash = `scrypt$${pilotSalt}$${pilotHash}`;
const routeAccounts = [
  {
    id: "phase3-pcp",
    displayName: "Phase 3 PCP",
    role: "PCP",
    passwordHash: pilotPasswordHash
  },
  {
    id: "phase3-rad-onc",
    displayName: "Phase 3 Radiation Oncologist",
    role: "RAD_ONC",
    passwordHash: pilotPasswordHash
  }
];
const originalRouteEnv = {
  accounts: process.env.PILOT_ACCOUNTS_JSON,
  persistenceMode: process.env.CURERAYS_PERSISTENCE_MODE,
  sessionSecret: process.env.PILOT_SESSION_SECRET
};
const routeCourseSnapshot = structuredClone(course);

async function invokeAdvanceRoute(account, courseId, body) {
  const { token } = createPilotSession(account);
  const request = new NextRequest(`http://localhost/api/workflow/courses/${courseId}/advance`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      cookie: `${PILOT_SESSION_COOKIE}=${token}`
    },
    body: JSON.stringify(body)
  });
  const response = await advanceCourseRoute(request, { params: Promise.resolve({ courseId }) });
  return { status: response.status, body: await response.json() };
}

process.env.PILOT_ACCOUNTS_JSON = JSON.stringify(routeAccounts);
process.env.PILOT_SESSION_SECRET = Buffer.from(Array.from({ length: 32 }, (_, index) => index + 1)).toString("base64url");
process.env.CURERAYS_PERSISTENCE_MODE = "memory";

try {
  const pcpRouteResponse = await invokeAdvanceRoute(routeAccounts[0], course.id, {
    expectedCoursePhase: course.coursePhase,
    reason: "PCP must not advance a course."
  });
  assert.equal(pcpRouteResponse.status, 403, "Signed PCP advance request must return HTTP 403");

  const malformedReasonRouteResponse = await invokeAdvanceRoute(routeAccounts[1], "COURSE-PHASE3-UNKNOWN", {
    expectedCoursePhase: "CONSULTATION",
    reason: 17
  });
  assert.equal(malformedReasonRouteResponse.status, 400, "Non-string advance reason must return HTTP 400 before course lookup");
  assert.equal(malformedReasonRouteResponse.body.status, "VALIDATION_FAILED", "Malformed advance reason must return workflow validation status");

  const malformedPhaseRouteResponse = await invokeAdvanceRoute(routeAccounts[1], "COURSE-PHASE3-UNKNOWN", {
    expectedCoursePhase: { phase: "CONSULTATION" },
    reason: "Reject malformed expected phase."
  });
  assert.equal(malformedPhaseRouteResponse.status, 400, "Non-string expected course phase must return HTTP 400 before course lookup");
  assert.equal(malformedPhaseRouteResponse.body.status, "VALIDATION_FAILED", "Malformed expected phase must return workflow validation status");

  const missingPhaseRouteResponse = await invokeAdvanceRoute(routeAccounts[1], "COURSE-PHASE3-UNKNOWN", {
    reason: "Expected phase is required."
  });
  assert.equal(missingPhaseRouteResponse.status, 400, "Missing expected course phase must return HTTP 400 before course lookup");

  const staleRouteResponse = await invokeAdvanceRoute(routeAccounts[1], course.id, {
    expectedCoursePhase: "PLANNING",
    reason: "Reject stale course phase through route."
  });
  assert.equal(staleRouteResponse.status, 409, "Stale signed advance request must return HTTP 409");
  assert.equal(staleRouteResponse.body.status, "STALE", "Stale signed advance request must return workflow status STALE");
  assert.equal(course.coursePhase, routeCourseSnapshot.coursePhase, "Rejected route requests must not change course phase");
} finally {
  Object.assign(course, routeCourseSnapshot);
  for (const [key, value] of [
    ["PILOT_ACCOUNTS_JSON", originalRouteEnv.accounts],
    ["PILOT_SESSION_SECRET", originalRouteEnv.sessionSecret],
    ["CURERAYS_PERSISTENCE_MODE", originalRouteEnv.persistenceMode]
  ]) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
}
assert.deepEqual(course, routeCourseSnapshot, "Route checks must restore the synthetic course store state");
assert.equal(process.env.PILOT_ACCOUNTS_JSON, originalRouteEnv.accounts, "Route checks must restore PILOT_ACCOUNTS_JSON");
assert.equal(process.env.PILOT_SESSION_SECRET, originalRouteEnv.sessionSecret, "Route checks must restore PILOT_SESSION_SECRET");
assert.equal(process.env.CURERAYS_PERSISTENCE_MODE, originalRouteEnv.persistenceMode, "Route checks must restore persistence mode");

const coursePhaseBeforeAdvance = course.coursePhase;
const deniedAdvance = await workflowService.advanceCourseWorkflow(
  course.id,
  {
    expectedCoursePhase: coursePhaseBeforeAdvance,
    reason: "MA must not advance a course."
  },
  mutationContext("workflow:advance", "MA must not advance a course.", "MA")
);
assert.equal(deniedAdvance.ok, false, "MA course advancement must be denied");
assert.equal(course.coursePhase, coursePhaseBeforeAdvance, "Denied course advancement must not change phase");

const emptyReasonAdvance = await workflowService.advanceCourseWorkflow(
  course.id,
  {
    expectedCoursePhase: coursePhaseBeforeAdvance,
    reason: " "
  },
  mutationContext("workflow:advance", " ", "RAD_ONC")
);
assert.equal(emptyReasonAdvance.ok, false, "Course advancement must reject an empty reason");
assert.equal(emptyReasonAdvance.status, 400, "Empty course advance reason must return HTTP 400");
assert.equal(course.coursePhase, coursePhaseBeforeAdvance, "Invalid course advancement must not change phase");

const missingPhaseAdvance = await workflowService.advanceCourseWorkflow(
  course.id,
  {
    reason: "Expected phase is required."
  },
  mutationContext("workflow:advance", "Expected phase is required.", "RAD_ONC")
);
assert.equal(missingPhaseAdvance.ok, false, "Course advancement must require the expected phase");
assert.equal(missingPhaseAdvance.status, 400, "Missing expected course phase must return HTTP 400");
assert.equal(course.coursePhase, coursePhaseBeforeAdvance, "Missing expected phase must not change course state");

const staleAdvance = await workflowService.advanceCourseWorkflow(
  course.id,
  {
    expectedCoursePhase: "PLANNING",
    reason: "Reject stale course phase."
  },
  mutationContext("workflow:advance", "Reject stale course phase.", "RAD_ONC")
);
assert.equal(staleAdvance.ok, false, "Stale course advancement must be rejected");
assert.equal(staleAdvance.status, 409, "Stale course advancement must return HTTP 409");
assert.equal(staleAdvance.body.status, "STALE", "Stale course advancement must return workflow status STALE");
assert.equal(course.coursePhase, coursePhaseBeforeAdvance, "Stale course advancement must not change phase");

const advanced = await workflowService.advanceCourseWorkflow(
  course.id,
  {
    expectedCoursePhase: "CONSULTATION",
    reason: "Phase 3 guardrail advancement after blockers cleared."
  },
  mutationContext("workflow:advance", "Phase 3 guardrail advancement after blockers cleared."),
  "2026-06-12T00:00:00.000Z"
);
assert.equal(advanced.ok, true, "Course should advance after current blockers are cleared");
assert.equal(advanced.body.nextPhase, "CHART_PREP", "Course should advance to Chart Prep");
assert.equal(advanced.body.auditEvent.redacted, true, "Advancement audit event should be redacted");
assert.equal(advanced.body.auditEvent.userName, "Phase 3 RAD_ONC", "Advancement audit must preserve the named actor");

const editableTask = courseTasks.find((task) => task.responsibleParty === "RAD_ONC") ?? courseTasks[0];
const blockedWithoutReason = await workflowService.updateTaskCommand(
  editableTask.id,
  {
    status: "BLOCKED",
    expectedLastUpdatedAt: editableTask.lastUpdatedAt,
    changeReason: "Phase 3 blocked without reason guardrail."
  },
  taskContext
);
assert.equal(blockedWithoutReason.ok, false, "Blocked task state should require a reason");

const blockedTask = await workflowService.updateTaskCommand(
  editableTask.id,
  {
    status: "BLOCKED",
    blockedReason: "Waiting on mapped evidence.",
    expectedLastUpdatedAt: editableTask.lastUpdatedAt,
    changeReason: "Phase 3 guardrail blocked task with reason."
  },
  taskContext
);
assert.equal(blockedTask.ok, true, "Blocked task with reason should succeed");
assert.equal(blockedTask.body.task.blockedReason, "Waiting on mapped evidence.", "Blocked reason should be persisted");

const reopenedTask = await workflowService.updateTaskCommand(
  editableTask.id,
  {
    reopenReason: "Evidence arrived.",
    expectedLastUpdatedAt: blockedTask.body.task.lastUpdatedAt,
    changeReason: "Phase 3 guardrail reopened task."
  },
  taskContext
);
assert.equal(reopenedTask.ok, true, "Task reopen with reason should succeed");
assert.equal(reopenedTask.body.task.status, "PENDING", "Reopened task should return to pending");

const repository = workflowService.selectWorkflowTaskRepository();
const roleQueue = await repository.listQueue("TEAM_TASKS", "RAD_ONC", "2026-06-12T00:00:00.000Z");
assert.ok(roleQueue.tasks.every((task) => task.responsibleParty === "RAD_ONC"), "Team queue should filter by role");
assert.equal(roleQueue.tasks.some((task) => "courseId" in task), false, "Operational task DTOs must not include raw courseId");

console.log("Phase 3 workflow engine guardrails passed");
