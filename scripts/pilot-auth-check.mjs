import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

async function readSourceTree(path) {
  const entries = await readdir(new URL(`../${path}`, import.meta.url), {
    recursive: true,
    withFileTypes: true,
  });
  return Promise.all(
    entries
      .filter((entry) => entry.isFile() && /\.[cm]?[jt]sx?$/.test(entry.name))
      .map((entry) => readFile(`${entry.parentPath}/${entry.name}`, 'utf8')),
  ).then((sources) => sources.join('\n'));
}

const [
  session,
  login,
  logout,
  sessionRoute,
  proxy,
  passwordHash,
  envExample,
  appSources,
  componentSources,
  libSources,
] = await Promise.all([
  read('lib/server/pilot-session.ts'),
  read('app/api/auth/login/route.ts'),
  read('app/api/auth/logout/route.ts'),
  read('app/api/auth/session/route.ts'),
  read('proxy.ts'),
  read('scripts/pilot-password-hash.mjs'),
  read('.env.example'),
  readSourceTree('app'),
  readSourceTree('components'),
  readSourceTree('lib'),
]);

assert.match(session, /PILOT_ACCOUNTS_JSON/);
assert.match(session, /PILOT_SESSION_SECRET/);
assert.match(session, /Array\.isArray\(parsed\)[^]*parsed\.length === 0/);
assert.match(session, /ids\.has\(id\)/);
assert.match(session, /Object\.keys\(value\)\.sort\(\)/);
assert.match(session, /canonicalBase64Url\(source\)/);
assert.match(session, /secret\.length < 32[^]*secret\.length > 64/);
assert.match(session, /new Set\(secret\)\.size < 16/);
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
assert.doesNotMatch(
  componentSources,
  /x-curerays-(?:role|user|session|device)/i,
);
assert.doesNotMatch(
  appSources + componentSources + libSources,
  /prototype-session/i,
);
assert.doesNotMatch(
  appSources,
  /systemPhiAccess/,
);
assert.match(session, /if \(!origin\) return false/);
assert.match(session, /\.origin === expectedOrigin/);
assert.match(envExample, /PILOT_SESSION_SECRET="<base64url-encoded-32-to-64-random-bytes>"/);

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
const accountId = process.env.PILOT_AUTH_ACCOUNT_ID;
const password = process.env.PILOT_AUTH_PASSWORD;
assert.equal(
  [baseUrl, accountId, password].filter(Boolean).length,
  baseUrl || accountId || password ? 3 : 0,
  'PILOT_AUTH_BASE_URL, PILOT_AUTH_ACCOUNT_ID, and PILOT_AUTH_PASSWORD must be supplied together',
);

if (baseUrl) {
  const origin = new URL(baseUrl).origin;
  const anonymous = await fetch(`${baseUrl}/api/auth/session`);
  assert.equal(anonymous.status, 401);

  const spoofedHeaders = await fetch(`${baseUrl}/api/workflow`, {
    headers: {
      'x-curerays-role': 'ADMIN',
      'x-curerays-user-id': 'spoofed',
      'x-curerays-session-id': 'spoofed',
      'x-curerays-device-id': 'spoofed',
    },
  });
  assert.equal(spoofedHeaders.status, 401);

  const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      origin,
    },
    body: JSON.stringify({ accountId, password }),
  });
  assert.equal(loginResponse.status, 200);
  const setCookie = loginResponse.headers.get('set-cookie') ?? '';
  assert.match(setCookie, /^curerays_pilot_session=[^;]+/);
  assert.match(setCookie, /HttpOnly/i);
  assert.match(setCookie, /SameSite=Lax/i);
  assert.match(setCookie, /Path=\//i);
  assert.match(setCookie, /Max-Age=28800/i);
  if (origin.startsWith('https:')) assert.match(setCookie, /Secure/i);

  const cookie = setCookie.split(';', 1)[0];
  const loginBody = await loginResponse.json();
  assert.equal(loginBody.session.id, accountId);
  assert.equal(typeof loginBody.session.displayName, 'string');
  assert.ok(loginBody.session.displayName.length > 1);
  assert.equal(typeof loginBody.session.role, 'string');
  assert.ok(loginBody.session.role.length > 1);
  const expiresIn = Date.parse(loginBody.session.expiresAt) - Date.now();
  assert.ok(expiresIn > 28_700_000 && expiresIn <= 28_800_000);

  const authenticated = await fetch(`${baseUrl}/api/auth/session`, {
    headers: { cookie },
  });
  assert.equal(authenticated.status, 200);
  const authenticatedBody = await authenticated.json();
  assert.deepEqual(authenticatedBody, loginBody);

  const [cookieName, token] = cookie.split('=');
  const tamperedToken = `${token.slice(0, -1)}${token.endsWith('a') ? 'b' : 'a'}`;
  const invalidSignature = await fetch(`${baseUrl}/api/auth/session`, {
    headers: { cookie: `${cookieName}=${tamperedToken}` },
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

  const schemeDifferentOrigin = origin.startsWith('https:')
    ? origin.replace(/^https:/, 'http:')
    : origin.replace(/^http:/, 'https:');
  const crossOrigin = await fetch(`${baseUrl}/api/auth/logout`, {
    method: 'POST',
    headers: {
      cookie,
      origin: schemeDifferentOrigin,
    },
  });
  assert.equal(crossOrigin.status, 403);

  const missingOrigin = await fetch(`${baseUrl}/api/auth/logout`, {
    method: 'POST',
    headers: { cookie },
  });
  assert.equal(missingOrigin.status, 403);

  const logoutResponse = await fetch(`${baseUrl}/api/auth/logout`, {
    method: 'POST',
    headers: {
      cookie,
      origin,
    },
  });
  assert.equal(logoutResponse.status, 200);
  const clearCookie = logoutResponse.headers.get('set-cookie') ?? '';
  assert.match(clearCookie, /^curerays_pilot_session=/);
  assert.match(clearCookie, /Max-Age=0/i);

  const loggedOut = await fetch(`${baseUrl}/api/auth/session`, {
    headers: { cookie: clearCookie.split(';', 1)[0] },
  });
  assert.equal(loggedOut.status, 401);
}

console.log(`pilot auth check passed${baseUrl ? ' (source + HTTP)' : ' (source)'}`);
