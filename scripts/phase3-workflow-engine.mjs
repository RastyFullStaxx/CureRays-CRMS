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

for (const expected of ["workflow:mutate", "task:mutate"]) {
  assertIncludes(rbacSource, expected, `RBAC must include ${expected}`);
}

for (const expected of [
  "removedCarepathSteps",
  "optionalCarepathSteps",
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
assertExcludes(read(workflowRoutePath), "@/lib/clinical-store", "Workflow route must not import clinical-store directly");
assertIncludes(packageJson, '"test:phase3"', "package.json must expose Phase 3 guardrail");
assertIncludes(packageJson, "npm run test:phase3", "npm run verify must include Phase 3 guardrail");

installTsHook();

const workflowService = require(join(root, servicePath));
const patientService = require(join(root, "lib/server/patient-registration-service.ts"));
const store = require(join(root, "lib/clinical-store.ts"));

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

const createContext = patientService.patientMutationContextFromRequest(
  { headers: { get: (name) => name.toLowerCase() === "x-curerays-role" ? "RAD_ONC" : null } },
  "phi:create",
  "Phase 3 create workflow bundle"
);
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

const workflowContext = mutationContext("workflow:mutate", "Phase 3 complete consultation step");
const taskContext = mutationContext("task:mutate", "Phase 3 complete consultation task");
const consultationStep = courseSteps.find((step) => step.stepNumber === 0);
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

const advanced = await workflowService.advanceCourseWorkflow(
  course.id,
  {
    expectedCoursePhase: "CONSULTATION",
    changeReason: "Phase 3 guardrail advancement after blockers cleared."
  },
  workflowContext,
  "2026-06-12T00:00:00.000Z"
);
assert.equal(advanced.ok, true, "Course should advance after current blockers are cleared");
assert.equal(advanced.body.nextPhase, "CHART_PREP", "Course should advance to Chart Prep");
assert.equal(advanced.body.auditEvent.redacted, true, "Advancement audit event should be redacted");

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
