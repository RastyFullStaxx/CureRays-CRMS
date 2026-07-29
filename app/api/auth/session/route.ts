import { NextRequest, NextResponse } from 'next/server';
import { pilotSessionFromRequest } from '@/lib/server/pilot-session';

export async function GET(request: NextRequest) {
  const session = pilotSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ message: 'Authentication required.' }, { status: 401 });
  }

  return NextResponse.json({
    session: {
      id: session.id,
      displayName: session.displayName,
      role: session.role,
      expiresAt: session.expiresAt,
    },
  });
}
