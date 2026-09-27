import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Always allow Next.js internal files, favicon, auth, and microservice streams
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/api/whatsapp') ||
    pathname.startsWith('/api/operations') ||
    pathname === '/api/system/status' ||
    pathname === '/favicon.ico' ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const sessionToken = request.cookies.get('opsguard_session')?.value;

  // 2. Always allow login & register pages without middleware interception
  // This completely eliminates any redirect loop if the browser has an old or expired cookie
  if (pathname === '/login' || pathname === '/register') {
    return NextResponse.next();
  }

  // 3. Root landing page "/":
  // When logged in, visiting "/" automatically redirects to "/home"
  if (pathname === '/' && sessionToken) {
    if (!request.nextUrl.searchParams.has('public')) {
      return NextResponse.redirect(new URL('/home', request.url));
    }
  }

  // Public access to root "/" and "/welcome"
  if (pathname === '/' || pathname === '/welcome') {
    return NextResponse.next();
  }

  // 4. For all other protected pages (e.g. /home):
  if (!sessionToken) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Authentication required to access AgentsGuard API' },
        { status: 401 }
      );
    }

    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static files
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
