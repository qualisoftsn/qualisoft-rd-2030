/**
 * 🛡️ MODULE : SDE KERNEL PROXY (SÉCURITÉ ABSOLUE)
 * -------------------------------------------------------------------------
 * RÔLE : Sentinelle de périmètre.
 * FIX : Autorisation absolue de /auth (ton nouveau dossier) et de l'API.
 * RÉVISION : 07 Mars 2026 | 13:30 GMT
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('access_token')?.value;

  // 1. 🏳️ LISTE BLANCHE (Libre passage)
  if (
    pathname.startsWith('/api') || 
    pathname.startsWith('/auth') || // ✅ Autorise ton nouveau dossier physique
    pathname.startsWith('/_next') || 
    pathname.startsWith('/images') || 
    pathname.startsWith('/public') || 
    pathname === '/favicon.ico' ||
    pathname === '/'
  ) {
    return NextResponse.next();
  }

  // 2. 🛡️ PROTECTION DES ZONES PRIVÉES
  const privateRoutes = ['/dashboard', '/admin', '/workspace', '/risks', '/audits'];
  const isPrivate = privateRoutes.some(route => pathname.startsWith(route));

  if (isPrivate && !token) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('session', 'expired');
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.).*)'],
};