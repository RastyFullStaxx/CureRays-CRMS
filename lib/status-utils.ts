export type BadgeVariant = "default" | "success" | "warning" | "error" | "info" | "primary";

function normalize(value: string | null | undefined) {
  return String(value ?? "")
    .trim()
    .replace(/[\s-]+/g, "_")
    .toUpperCase();
}

/**
 * Maps data-layer tone strings to Badge/StatusBadge variant values.
 * Used across pages to keep status color mapping consistent.
 */
export function mapTone(t: string): BadgeVariant {
  if (t === "green" || t === "emerald") return "success";
  if (t === "orange") return "warning";
  if (t === "red") return "error";
  if (t === "purple") return "primary";
  if (t === "blue") return "info";
  return "default";
}

export function statusTone(status: string | null | undefined): BadgeVariant {
  const value = normalize(status);

  if ([
    "COMPLETE",
    "COMPLETED",
    "SIGNED",
    "UPLOADED",
    "EXPORTED",
    "LOCKED",
    "APPROVED",
    "READY",
    "CLEAR",
    "ACTIVE",
    "TAGGED",
  ].includes(value)) return "success";

  if ([
    "BLOCKED",
    "OVERDUE",
    "MISSING",
    "MISSING_FIELDS",
    "VOIDED",
    "REVISION_NEEDED",
    "NEEDS_OVERRIDE",
    "FAILED",
    "ERROR",
    "NONE",
    "MISSED",
    "CANCELLED",
  ].includes(value)) return "error";

  if ([
    "READY_FOR_REVIEW",
    "NEEDS_REVIEW",
    "REVIEW_REQUIRED",
    "PENDING_NEEDED",
    "PENDING_SIGNATURE",
    "PENDING",
    "ON_HOLD",
    "PAUSED",
    "DRAFT",
    "OPEN",
    "QUEUED",
    "RESCHEDULED",
  ].includes(value)) return "warning";

  if ([
    "IN_PROGRESS",
    "IN_REVIEW",
    "SCHEDULED",
    "AUTO_LOOKUP",
    "UPCOMING",
    "ON_TREATMENT",
    "READY_FOR_SCHEDULE",
  ].includes(value)) return "primary";

  if ([
    "AUDIT_READY",
  ].includes(value)) return "success";

  if ([
    "REVIEW",
    "CLOSEOUT_REVIEW",
    "REQUIRED",
    "DUE",
    "CLINICAL_VALIDATION_REQUIRED",
  ].includes(value)) return "warning";

  if (["NOT_STARTED", "NOT_APPLICABLE", "N_A", "NA", "CLOSED", "POST"].includes(value)) return "default";

  return "default";
}

export function phaseTone(phase: string | null | undefined): BadgeVariant {
  const value = normalize(phase);

  if (["CLOSED", "POST", "POST_TX", "POST_TREATMENT", "AUDIT"].includes(value)) return "success";
  if (["ON_TREATMENT", "ON_TX", "TREATMENT", "TREATMENT_DELIVERY"].includes(value)) return "primary";
  if (["PLANNING", "TREATMENT_PLANNING", "SIMULATION"].includes(value)) return "info";
  if (["CHART_PREP", "CONSULT", "CONSULTATION", "UPCOMING"].includes(value)) return "warning";
  if (["NOT_APPLICABLE", "N_A", "NA"].includes(value)) return "default";

  return "default";
}

export function priorityTone(priority: string | null | undefined): BadgeVariant {
  const value = normalize(priority);

  if (["URGENT", "STAT", "CRITICAL"].includes(value)) return "error";
  if (["HIGH", "MEDIUM"].includes(value)) return "warning";
  if (["LOW"].includes(value)) return "default";

  return "default";
}
