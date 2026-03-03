/**
 * 🛰️ MODULE : middleware.ts
 * RÉVISION : 03 Mars 2026 | 22:50 GMT
 * FIX : Libération totale de la racine '/' et des dossiers publics.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('qualisoft_token')?.value;

  // 1. LIBÉRATION DES ASSETS & API PUBLIQUE
  if (
    pathname.startsWith('/_next') || 
    pathname.startsWith('/api/public') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/favicon.ico')
  ) {
    return NextResponse.next();
  }

  // 2. LIBÉRATION DE LA RACINE (Landing Page Elite)
  if (pathname === '/') {
    return NextResponse.next();
  }

  // 3. GESTION DES PAGES D'AUTH
  if (pathname.startsWith('/auth')) {
    if (token) return NextResponse.redirect(new URL('/dashboard', request.url));
    return NextResponse.next();
  }

  // 4. PROTECTION DU DASHBOARD
  if (pathname.startsWith('/dashboard') && !token) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};