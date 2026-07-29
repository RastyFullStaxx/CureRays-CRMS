import "server-only";

import type { NextRequest } from "next/server";
import { pilotSessionFromRequest } from "@/lib/server/pilot-session";
import type { PrototypeAccessRole } from "@/lib/types";

export type PrototypeSessionClaims = {
  role: PrototypeAccessRole;
  userId: string;
  userName: string;
  sessionId: string;
  ipAddress: string;
  deviceId: string;
};

export function prototypeSessionFromRequest(request: NextRequest): PrototypeSessionClaims | null {
  const session = pilotSessionFromRequest(request);
  if (!session) return null;

  return {
    role: session.role,
    userId: session.userId,
    userName: session.userName,
    sessionId: session.sessionId,
    ipAddress: session.ipAddress,
    deviceId: session.deviceId
  };
}
