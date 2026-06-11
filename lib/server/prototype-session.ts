import "server-only";

import type { NextRequest } from "next/server";
import { PROTOTYPE_ROLE_HEADER, normalizeRole, roleLabels } from "@/lib/rbac";
import type { PrototypeAccessRole } from "@/lib/types";

export type PrototypeSessionClaims = {
  role: PrototypeAccessRole;
  userId: string;
  userName: string;
  sessionId: string;
  ipAddress: string;
  deviceId: string;
};

function safeText(value: string | null | undefined) {
  return String(value ?? "").trim();
}

function actorNameForRole(role: PrototypeAccessRole) {
  if (role === "CLINICIAN") {
    return "Prototype Clinician";
  }

  if (role === "SYSTEM") {
    return "Prototype System";
  }

  return roleLabels[role];
}

function requestIpAddress(request: NextRequest) {
  const forwarded = safeText(request.headers.get("x-forwarded-for"));
  const forwardedFirst = safeText(forwarded.split(",")[0]);
  return forwardedFirst || safeText(request.headers.get("x-real-ip")) || "prototype-ip";
}

export function prototypeSessionFromRequest(request: NextRequest): PrototypeSessionClaims | null {
  const headerRole = normalizeRole(request.headers.get(PROTOTYPE_ROLE_HEADER));
  const fallbackRole = normalizeRole(process.env.CURERAYS_PROTOTYPE_ROLE);
  const role = headerRole ?? fallbackRole ?? (process.env.NODE_ENV === "production" ? null : "RAD_ONC");

  if (!role) {
    return null;
  }

  return {
    role,
    userId:
      safeText(request.headers.get("x-curerays-user-id")) ||
      `PROTOTYPE-${safeText(request.headers.get(PROTOTYPE_ROLE_HEADER)) || role}`,
    userName: safeText(request.headers.get("x-curerays-user-name")) || actorNameForRole(role),
    sessionId: safeText(request.headers.get("x-curerays-session-id")) || "prototype-session",
    ipAddress: requestIpAddress(request),
    deviceId: safeText(request.headers.get("x-curerays-device-id")) || "prototype-device"
  };
}
