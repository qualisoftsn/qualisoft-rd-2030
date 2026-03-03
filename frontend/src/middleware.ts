/**
 * 🛰️ MODULE : middleware.ts
 * RÉVISION : 03 Mars 2026 | 23:25 GMT
 * CORRECTIF : Suppression du détournement forcé de la racine.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('qualisoft_token')?.value;

  // 1. LAISSER PASSER LA RACINE (LANDING PAGE)
  // C'est cette ligne qui empêche la redirection vers /auth/login
  if (pathname === '/') {
    return NextResponse.next();
  }

  // 2. LAISSER PASSER LES ASSETS
  if (pathname.startsWith('/_next') || pathname.startsWith('/images') || pathname.startsWith('/api/public')) {
    return NextResponse.next();
  }

  // 3. PROTÉGER LE DASHBOARD UNIQUEMENT
  if (pathname.startsWith('/dashboard') && !token) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};