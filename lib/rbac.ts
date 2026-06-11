import type { FractionApprovalType, PrototypeAccessRole, ResponsibleParty } from "@/lib/types";

export const PROTOTYPE_ROLE_HEADER = "x-curerays-role";

export type RoleAction =
  | "phi:read"
  | "phi:create"
  | "phi:update"
  | "igsrt:mutate"
  | "fraction:approve_md"
  | "fraction:approve_dot"
  | "document:render"
  | "document:sign";

export type RoleMatrixRow = {
  role: ResponsibleParty;
  label: string;
  moduleAccess: Record<string, "full" | "edit" | "view" | "none" | "na">;
  actions: RoleAction[];
};

export const roleLabels: Record<ResponsibleParty, string> = {
  VA: "Virtual Assistant",
  MA: "Medical Assistant",
  RTT: "Radiation Therapist",
  NP_PA: "NP / PA",
  PCP: "Doctor / PCP",
  RAD_ONC: "Radiation Oncologist",
  PHYSICIST: "Medical Physicist",
  BILLING: "Billing Staff",
  ADMIN: "Administrator"
};

const allPhiActions: RoleAction[] = ["phi:read", "phi:create", "phi:update"];

export const roleMatrix: RoleMatrixRow[] = [
  {
    role: "VA",
    label: roleLabels.VA,
    moduleAccess: { patients: "view", tasks: "edit", schedule: "edit", documents: "view", billing: "none", audit: "none", settings: "none" },
    actions: ["phi:read"]
  },
  {
    role: "MA",
    label: roleLabels.MA,
    moduleAccess: { patients: "view", tasks: "edit", schedule: "edit", documents: "edit", billing: "none", audit: "view", settings: "none" },
    actions: ["phi:read", "phi:update", "igsrt:mutate"]
  },
  {
    role: "RTT",
    label: roleLabels.RTT,
    moduleAccess: { patients: "view", tasks: "edit", schedule: "edit", documents: "view", billing: "none", audit: "view", settings: "none" },
    actions: ["phi:read", "phi:update", "igsrt:mutate", "fraction:approve_dot"]
  },
  {
    role: "NP_PA",
    label: roleLabels.NP_PA,
    moduleAccess: { patients: "view", tasks: "edit", schedule: "view", documents: "edit", billing: "none", audit: "view", settings: "none" },
    actions: ["phi:read", "phi:update", "igsrt:mutate", "document:render"]
  },
  {
    role: "PCP",
    label: roleLabels.PCP,
    moduleAccess: { patients: "view", tasks: "view", schedule: "view", documents: "view", billing: "none", audit: "none", settings: "none" },
    actions: ["phi:read"]
  },
  {
    role: "RAD_ONC",
    label: roleLabels.RAD_ONC,
    moduleAccess: { patients: "full", tasks: "edit", schedule: "view", documents: "edit", billing: "view", audit: "view", settings: "none" },
    actions: [...allPhiActions, "igsrt:mutate", "fraction:approve_md", "document:render", "document:sign"]
  },
  {
    role: "PHYSICIST",
    label: roleLabels.PHYSICIST,
    moduleAccess: { patients: "view", tasks: "edit", schedule: "view", documents: "edit", billing: "none", audit: "edit", settings: "none" },
    actions: ["phi:read", "phi:update", "igsrt:mutate", "document:render"]
  },
  {
    role: "BILLING",
    label: roleLabels.BILLING,
    moduleAccess: { patients: "none", tasks: "edit", schedule: "none", documents: "view", billing: "edit", audit: "view", settings: "none" },
    actions: []
  },
  {
    role: "ADMIN",
    label: roleLabels.ADMIN,
    moduleAccess: { patients: "full", tasks: "full", schedule: "full", documents: "full", billing: "full", audit: "full", settings: "full" },
    actions: [...allPhiActions, "igsrt:mutate", "fraction:approve_md", "fraction:approve_dot", "document:render", "document:sign"]
  }
];

const roleRowsByRole = new Map(roleMatrix.map((row) => [row.role, row]));

export function normalizeRole(value: string | null | undefined): PrototypeAccessRole | null {
  const normalized = String(value ?? "").trim().toUpperCase();
  if (!normalized) {
    return null;
  }

  if (normalized === "CLINICIAN" || normalized === "SYSTEM") {
    return normalized;
  }

  return roleRowsByRole.has(normalized as ResponsibleParty) ? (normalized as ResponsibleParty) : null;
}

export function roleCan(role: PrototypeAccessRole | null | undefined, action: RoleAction) {
  if (role === "SYSTEM") {
    return true;
  }

  if (role === "CLINICIAN") {
    return action === "phi:read";
  }

  if (!role) {
    return false;
  }

  return roleRowsByRole.get(role)?.actions.includes(action) ?? false;
}

export function canAccessPhi(role: PrototypeAccessRole | null | undefined) {
  return roleCan(role, "phi:read");
}

export function canApproveFraction(role: PrototypeAccessRole | null | undefined, approvalType: FractionApprovalType) {
  return approvalType === "DOT"
    ? roleCan(role, "fraction:approve_dot")
    : roleCan(role, "fraction:approve_md");
}
