import { NextRequest, NextResponse } from 'next/server';
import {
  isSameOriginRequest,
  pilotSessionFromRequest,
} from '@/lib/server/pilot-session';
import { isSitePath } from '@/lib/site-routes';

function isPublicPath(pathname: string): boolean {
  return (
    isSitePath(pathname) ||
    pathname === '/login' ||
    pathname.startsWith('/api/auth/') ||
    pathname.startsWith('/_next/') ||
    (!pathname.startsWith('/api/') && /\/[^/]+\.[^/]+$/.test(pathname))
  );
}

export function proxy(request: NextRequest) {
  if (isPublicPath(request.nextUrl.pathname)) return NextResponse.next();

  const session = pilotSessionFromRequest(request);
  if (!session) {
    if (request.nextUrl.pathname.startsWith('/api/')) {
      return NextResponse.json({ message: 'Authentication required.' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (
    request.nextUrl.pathname.startsWith('/api/') &&
    !['GET', 'HEAD', 'OPTIONS'].includes(request.method) &&
    !isSameOriginRequest(request)
  ) {
    return NextResponse.json({ message: 'Request origin is not allowed.' }, { status: 403 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/:path*',
};
