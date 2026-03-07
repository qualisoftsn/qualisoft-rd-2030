/**
 * 🛡️ MODULE : SDE KERNEL PROXY (SÉCURITÉ ABSOLUE)
 * RÉVISION : 07 Mars 2026 | 17:15 GMT
 */
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('access_token')?.value;

  const isPublic = 
    pathname.startsWith('/api') || 
    pathname.startsWith('/auth') || 
    pathname.startsWith('/external') || 
    pathname.startsWith('/_next') || 
    pathname === '/' ||
    pathname === '/favicon.ico';

  if (isPublic) return NextResponse.next();

  if ((pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) && !token) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('session', 'expired');
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.).*)'],
};