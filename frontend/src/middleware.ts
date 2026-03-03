/**
 * 🛰️ MODULE : middleware.ts (SENTINELLE MATRIX)
 * -------------------------------------------------------------------------
 * RÉPARATION : Libération de la racine pour la Landing Page.
 * RÉVISION : 03 Mars 2026 | 19:15 GMT
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/api/public', '/images', '/assets', '/favicon.ico'];
const AUTH_PATHS = ['/auth/login', '/auth/register'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('qualisoft_token')?.value;

  // 1. Autoriser les assets publics (Images, Styles, JS)
  if (PUBLIC_PATHS.some(path => pathname.startsWith(path)) || pathname.startsWith('/_next')) {
    return NextResponse.next();
  }

  const isAuthPage = AUTH_PATHS.some(path => pathname.startsWith(path));
  const isLandingPage = pathname === '/';
  const isDashboardRoute = pathname.startsWith('/dashboard');

  // ✅ CAS 1 : La Landing Page (/) est TOUJOURS accessible
  if (isLandingPage) {
    return NextResponse.next();
  }

  // ✅ CAS 2 : Déjà connecté sur une page Auth -> Vers le Dashboard
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // ✅ CAS 3 : Accès au Dashboard sans Token -> Login
  if (isDashboardRoute && !token) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api/public|_next/static|_next/image|images|assets|favicon.ico|robots.txt).*)'],
};