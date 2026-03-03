/**
 * 🛰️ MODULE : middleware.ts
 * RÉVISION : 03 Mars 2026 | 18:55 GMT
 * CORRECTIF : Libération de la Landing Page racine.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/api/public', '/images', '/assets', '/favicon.ico'];
const AUTH_PATHS = ['/auth/login', '/auth/register'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('qualisoft_token')?.value;

  // 1. Autoriser les assets publics
  if (PUBLIC_PATHS.some(path => pathname.startsWith(path)) || pathname.startsWith('/_next')) {
    return NextResponse.next();
  }

  // 🛡️ LOGIQUE SOUVERAINE
  const isAuthPage = AUTH_PATHS.some(path => pathname.startsWith(path));
  const isLandingPage = pathname === '/';
  const isDashboardRoute = pathname.startsWith('/dashboard');

  // CAS 1 : Autoriser toujours la Landing Page (Racine)
  if (isLandingPage) {
    return NextResponse.next();
  }

  // CAS 2 : Déjà connecté sur une page Auth -> Vers Dashboard
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // CAS 3 : Accès au Dashboard sans Token -> Login
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