import { NextRequest, NextResponse } from 'next/server';
import {
  authenticatePilotAccount,
  createPilotSession,
  isSameOriginRequest,
  PILOT_SESSION_COOKIE,
  pilotCookieOptions,
  PilotConfigurationError,
} from '@/lib/server/pilot-session';

const invalidCredentials = { message: 'Invalid account ID or password.' };

export async function POST(request: NextRequest) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ message: 'Request origin is not allowed.' }, { status: 403 });
  }

  try {
    const body: unknown = await request.json();
    if (
      typeof body !== 'object' ||
      body === null ||
      !('accountId' in body) ||
      !('password' in body) ||
      typeof body.accountId !== 'string' ||
      typeof body.password !== 'string' ||
      body.accountId.length > 64 ||
      body.password.length < 1 ||
      body.password.length > 1024
    ) {
      return NextResponse.json(invalidCredentials, { status: 401 });
    }

    const account = await authenticatePilotAccount(body.accountId, body.password);
    if (!account) return NextResponse.json(invalidCredentials, { status: 401 });

    const { token, session } = createPilotSession(account);
    const response = NextResponse.json({ session });
    response.cookies.set(PILOT_SESSION_COOKIE, token, pilotCookieOptions());
    return response;
  } catch (error) {
    if (error instanceof PilotConfigurationError) {
      return NextResponse.json({ message: 'Authentication is unavailable.' }, { status: 503 });
    }
    return NextResponse.json(invalidCredentials, { status: 401 });
  }
}
