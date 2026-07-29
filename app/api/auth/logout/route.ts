import { NextRequest, NextResponse } from 'next/server';
import {
  isSameOriginRequest,
  PILOT_SESSION_COOKIE,
  pilotCookieOptions,
} from '@/lib/server/pilot-session';

export async function POST(request: NextRequest) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ message: 'Request origin is not allowed.' }, { status: 403 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(PILOT_SESSION_COOKIE, '', pilotCookieOptions(0));
  return response;
}
