import { getWorkflowSteps } from "@/lib/module-data";

export const workflowService = {
  listSteps(courseId?: string) {
    return getWorkflowSteps(courseId);
  },
  canAdvanceCourse(courseId: string) {
    const blockers = getWorkflowSteps(courseId).filter((step) =>
      ["BLOCKED", "OVERDUE"].includes(step.status)
    );
    return { allowed: blockers.length === 0, blockers };
  },
  markNotApplicable(stepId: string, reason: string) {
    if (!reason.trim()) {
      throw new Error("N/A workflow steps require a reason.");
    }
    return { stepId, status: "NOT_APPLICABLE", naReason: reason };
  }
};
