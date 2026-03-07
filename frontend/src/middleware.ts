/**
 * 🛡️ MODULE : SDE KERNEL PROXY (ELITE-SDE)
 * -------------------------------------------------------------------------
 * RÔLE : Sentinelle périmétrique.
 * FIX : Autorisation absolue de l'API pour éviter les réponses HTML sur subdomains.
 * RÉVISION : 07 Mars 2026 | 04:15 GMT
 * -------------------------------------------------------------------------
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('access_token')?.value;

  /**
   * 1. 🏳️ ZONE DE LIBRE PASSAGE (WHITELIST)
   * On autorise impérativement /api, /_next et les images pour éviter les 404.
   */
  const isPublic = 
    pathname.startsWith('/api') || 
    pathname.startsWith('/auth') || // 🛡️ Doit correspondre à ton dossier src/app/auth
    pathname.startsWith('/_next') || 
    pathname.startsWith('/images') || 
    pathname === '/favicon.ico' ||
    pathname === '/';

  if (isPublic) {
    return NextResponse.next();
  }

  /**
   * 2. 🛡️ PROTECTION DU DASHBOARD
   */
  const privatePrefixes = ['/dashboard', '/admin', '/workspace', '/risks', '/audits'];
  const isPrivateRoute = privatePrefixes.some(prefix => pathname.startsWith(prefix));

  if (isPrivateRoute && !token) {
    // 🛡️ Redirection vers le dossier d'auth exact
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('session', 'expired');
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match tout sauf les fichiers statiques physiques.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.).*)',
  ],
};