/**
 * 🛰️ MODULE : middleware.ts (elite-sde)
 * -------------------------------------------------------------------------
 * RÔLE : Sentinelle Frontend (Protection des routes).
 * FIX : Alignement sur le nom exact du cookie backend ('access_token').
 * RÉVISION : 04 Mars 2026 | 22:20 GMT
 * -------------------------------------------------------------------------
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 🛑 FIX VITAL : Le backend NestJS émet 'access_token', et non 'qualisoft_token'
  const token = request.cookies.get('access_token')?.value;

  // 1. LAISSER PASSER LA RACINE (LANDING PAGE)
  if (pathname === '/') {
    return NextResponse.next();
  }

  // 2. LAISSER PASSER LES ASSETS & ROUTES PUBLIQUES
  if (pathname.startsWith('/_next') || pathname.startsWith('/images') || pathname.startsWith('/api/public') || pathname.startsWith('/auth')) {
    return NextResponse.next();
  }

  // 3. PROTÉGER LE DASHBOARD UNIQUEMENT
  if (pathname.startsWith('/dashboard') && !token) {
    // Si pas de cookie, on éjecte proprement
    return NextResponse.redirect(new URL('/auth/login?session=expired', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};