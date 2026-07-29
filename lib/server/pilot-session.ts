import 'server-only';

import { createHmac, scrypt, timingSafeEqual } from 'node:crypto';
import type { NextRequest } from 'next/server';
import { roleLabels } from '@/lib/rbac';
import type { ResponsibleParty } from '@/lib/types';

export const PILOT_SESSION_COOKIE = 'curerays_pilot_session';
export const PILOT_SESSION_MAX_AGE = 8 * 60 * 60;

export type PilotAccount = {
  id: string;
  displayName: string;
  role: ResponsibleParty;
  passwordHash: string;
};

export type PilotSession = {
  id: string;
  displayName: string;
  role: ResponsibleParty;
  expiresAt: string;
};

export type PilotSessionClaims = PilotSession & {
  userId: string;
  userName: string;
  sessionId: string;
  ipAddress: string;
  deviceId: string;
};

type SignedClaims = {
  id: string;
  iat: number;
  exp: number;
};

export class PilotConfigurationError extends Error {
  constructor() {
    super('Pilot authentication is not configured.');
    this.name = 'PilotConfigurationError';
  }
}

function configurationError(): never {
  throw new PilotConfigurationError();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function canonicalBase64Url(value: string): Buffer {
  if (!/^[A-Za-z0-9_-]+$/.test(value)) configurationError();
  const decoded = Buffer.from(value, 'base64url');
  if (!decoded.length || decoded.toString('base64url') !== value) configurationError();
  return decoded;
}

function parsePasswordHash(value: string): { salt: Buffer; hash: Buffer } {
  const parts = value.split('$');
  if (parts.length !== 3 || parts[0] !== 'scrypt') configurationError();
  const salt = canonicalBase64Url(parts[1]);
  const hash = canonicalBase64Url(parts[2]);
  if (salt.length < 16 || salt.length > 64 || hash.length !== 64) configurationError();
  return { salt, hash };
}

function sessionSecret(): string {
  const secret = process.env.PILOT_SESSION_SECRET;
  if (
    !secret ||
    secret !== secret.trim() ||
    Buffer.byteLength(secret) < 32 ||
    new Set(secret).size < 8 ||
    /^(?:change-me|replace-me|<)/i.test(secret)
  ) {
    configurationError();
  }
  return secret;
}

export function configuredPilotAccounts(): PilotAccount[] {
  const source = process.env.PILOT_ACCOUNTS_JSON;
  if (!source) configurationError();

  let parsed: unknown;
  try {
    parsed = JSON.parse(source);
  } catch {
    configurationError();
  }
  if (!Array.isArray(parsed) || parsed.length === 0) configurationError();

  const ids = new Set<string>();
  return parsed.map((value) => {
    if (!isRecord(value)) configurationError();
    const keys = Object.keys(value).sort();
    if (keys.join(',') !== 'displayName,id,passwordHash,role') configurationError();

    const { id, displayName, role, passwordHash } = value;
    if (
      typeof id !== 'string' ||
      !/^[a-z0-9][a-z0-9._-]{0,63}$/.test(id) ||
      ids.has(id) ||
      typeof displayName !== 'string' ||
      displayName !== displayName.trim() ||
      displayName.length < 2 ||
      displayName.length > 100 ||
      typeof role !== 'string' ||
      !Object.hasOwn(roleLabels, role) ||
      typeof passwordHash !== 'string'
    ) {
      configurationError();
    }
    parsePasswordHash(passwordHash);
    ids.add(id);
    return {
      id,
      displayName,
      role: role as ResponsibleParty,
      passwordHash,
    };
  });
}

function accountById(accountId: string): PilotAccount | null {
  const normalizedId = accountId.trim().toLowerCase();
  return configuredPilotAccounts().find((account) => account.id === normalizedId) ?? null;
}

function derivePassword(password: string, salt: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, 64, (error, derivedKey) => {
      if (error) reject(error);
      else resolve(derivedKey);
    });
  });
}

export async function authenticatePilotAccount(
  accountId: string,
  password: string,
): Promise<PilotAccount | null> {
  const account = accountById(accountId);
  const parsedHash = account
    ? parsePasswordHash(account.passwordHash)
    : { salt: Buffer.alloc(16), hash: Buffer.alloc(64) };
  const derivedKey = await derivePassword(password, parsedHash.salt);
  return timingSafeEqual(derivedKey, parsedHash.hash) ? account : null;
}

function sign(payload: string): string {
  return createHmac('sha256', sessionSecret()).update(payload).digest('base64url');
}

function publicSession(account: PilotAccount, expiresAt: number): PilotSession {
  return {
    id: account.id,
    displayName: account.displayName,
    role: account.role,
    expiresAt: new Date(expiresAt * 1000).toISOString(),
  };
}

export function createPilotSession(account: PilotAccount, now = Date.now()) {
  sessionSecret();
  const issuedAt = Math.floor(now / 1000);
  const expiresAt = issuedAt + PILOT_SESSION_MAX_AGE;
  const claims: SignedClaims = { id: account.id, iat: issuedAt, exp: expiresAt };
  const payload = Buffer.from(JSON.stringify(claims)).toString('base64url');
  return {
    token: `${payload}.${sign(payload)}`,
    session: publicSession(account, expiresAt),
  };
}

function parseClaims(token: string, now = Date.now()): SignedClaims | null {
  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [payload, signature] = parts;
  if (!/^[A-Za-z0-9_-]+$/.test(payload) || !/^[A-Za-z0-9_-]+$/.test(signature)) return null;
  const suppliedSignature = Buffer.from(signature, 'base64url');
  const expectedSignature = Buffer.from(sign(payload), 'base64url');
  if (
    suppliedSignature.length !== expectedSignature.length ||
    !timingSafeEqual(suppliedSignature, expectedSignature)
  ) {
    return null;
  }

  let claims: unknown;
  try {
    claims = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
  } catch {
    return null;
  }
  if (!isRecord(claims) || Object.keys(claims).sort().join(',') !== 'exp,iat,id') {
    return null;
  }
  const { id, iat, exp } = claims;
  const currentTime = Math.floor(now / 1000);
  if (
    typeof id !== 'string' ||
    typeof iat !== 'number' ||
    typeof exp !== 'number' ||
    !Number.isInteger(iat) ||
    !Number.isInteger(exp) ||
    iat < 1 ||
    exp - iat !== PILOT_SESSION_MAX_AGE ||
    iat > currentTime + 60 ||
    exp <= currentTime
  ) {
    return null;
  }
  return { id, iat, exp };
}

function cookieToken(request: NextRequest): string | null {
  return request.cookies.get(PILOT_SESSION_COOKIE)?.value ?? null;
}

function requestIpAddress(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip')?.trim() ||
    'unavailable'
  );
}

export function pilotSessionFromRequest(request: NextRequest): PilotSessionClaims | null {
  try {
    const token = cookieToken(request);
    if (!token) return null;
    const claims = parseClaims(token);
    if (!claims) return null;
    const account = configuredPilotAccounts().find((candidate) => candidate.id === claims.id);
    if (!account) return null;

    return {
      ...publicSession(account, claims.exp),
      userId: account.id,
      userName: account.displayName,
      sessionId: `pilot:${account.id}:${claims.iat}`,
      ipAddress: requestIpAddress(request),
      deviceId: 'pilot-browser',
    };
  } catch {
    return null;
  }
}

export function pilotCookieOptions(maxAge = PILOT_SESSION_MAX_AGE) {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge,
  };
}

export function isSameOriginRequest(request: NextRequest): boolean {
  const origin = request.headers.get('origin');
  if (!origin) return true;
  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host');
  if (!host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}
