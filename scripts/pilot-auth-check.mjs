import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');
const [session, login, logout, sessionRoute, proxy, passwordHash] = await Promise.all([
  read('lib/server/pilot-session.ts'),
  read('app/api/auth/login/route.ts'),
  read('app/api/auth/logout/route.ts'),
  read('app/api/auth/session/route.ts'),
  read('proxy.ts'),
  read('scripts/pilot-password-hash.mjs'),
]);

assert.match(session, /PILOT_ACCOUNTS_JSON/);
assert.match(session, /PILOT_SESSION_SECRET/);
assert.match(session, /Array\.isArray\(parsed\)[^]*parsed\.length === 0/);
assert.match(session, /ids\.has\(id\)/);
assert.match(session, /Object\.keys\(value\)\.sort\(\)/);
assert.match(session, /Buffer\.byteLength\(secret\) < 32/);
assert.match(session, /createHmac\('sha256'/);
assert.match(session, /timingSafeEqual\(derivedKey, parsedHash\.hash\)/);
assert.match(session, /timingSafeEqual\(suppliedSignature, expectedSignature\)/);
assert.match(session, /exp - iat !== PILOT_SESSION_MAX_AGE/);
assert.match(session, /exp <= currentTime/);
assert.match(session, /configuredPilotAccounts\(\)\.find/);
assert.doesNotMatch(
  session + login + logout + sessionRoute + proxy,
  /CURERAYS_PROTOTYPE_ROLE|x-curerays-role|x-curerays-user|console\./i,
);

assert.match(login, /const invalidCredentials = \{ message: 'Invalid account ID or password\.' \}/);
assert.match(login + logout + proxy, /isSameOriginRequest/);
assert.match(session, /httpOnly: true/);
assert.match(session, /sameSite: 'lax'/);
assert.match(session, /secure: process\.env\.NODE_ENV === 'production'/);
assert.match(session, /path: '\/'/);
assert.match(session, /8 \* 60 \* 60/);
assert.match(sessionRoute + proxy, /status: 401/);
assert.match(proxy, /NextResponse\.redirect\(new URL\('\/login'/);
assert.match(proxy, /pathname\.startsWith\('\/_next\/'\)/);
assert.match(proxy, /\/\\\/\[\^\/\]\+\\\.\[\^\/\]\+\$\//);

assert.match(passwordHash, /process\.env\.PILOT_PASSWORD/);
assert.match(passwordHash, /randomBytes\(16\)/);
assert.match(passwordHash, /scryptCallback/);
assert.doesNotMatch(passwordHash, /console\.(?:error|warn|info|debug)|PILOT_ACCOUNTS_JSON/);

const baseUrl = process.env.PILOT_AUTH_BASE_URL;
if (baseUrl) {
  const anonymous = await fetch(`${baseUrl}/api/auth/session`);
  assert.equal(anonymous.status, 401);

  const invalidSignature = await fetch(`${baseUrl}/api/auth/session`, {
    headers: { cookie: 'curerays_pilot_session=invalid.invalid' },
  });
  assert.equal(invalidSignature.status, 401);

  const expiredPayload = Buffer.from(JSON.stringify({
    id: 'auth-check-user',
    iat: 1,
    exp: 2,
  })).toString('base64url');
  const expired = await fetch(`${baseUrl}/api/auth/session`, {
    headers: { cookie: `curerays_pilot_session=${expiredPayload}.invalid` },
  });
  assert.equal(expired.status, 401);

  const crossOrigin = await fetch(`${baseUrl}/api/auth/logout`, {
    method: 'POST',
    headers: { origin: 'https://attacker.invalid' },
  });
  assert.equal(crossOrigin.status, 403);

  const protectedApi = await fetch(`${baseUrl}/api/workflow`);
  assert.equal(protectedApi.status, 401);

  const protectedPage = await fetch(`${baseUrl}/patients`, { redirect: 'manual' });
  assert.equal(protectedPage.status, 307);
  assert.equal(new URL(protectedPage.headers.get('location'), baseUrl).pathname, '/login');
}

console.log(`pilot auth check passed${baseUrl ? ' (source + HTTP)' : ' (source)'}`);
