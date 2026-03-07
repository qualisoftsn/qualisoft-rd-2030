/**
 * 🛡️ MODULE : SDE KERNEL PROXY (ELITE-SDE)
 * -------------------------------------------------------------------------
 * RÔLE : Sentinelle périmétrique.
 * FIX : Exclusion stricte de l'API et des routes publiques pour éviter les 404/Redirections.
 * RÉVISION : 07 Mars 2026 | 04:15 GMT
 * -------------------------------------------------------------------------
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 🔍 Lecture du jeton HttpOnly émis par le backend NestJS
  const token = request.cookies.get('access_token')?.value;

  /**
   * 1. 🏳️ ZONE DE LIBRE PASSAGE (WHITELIST)
   * Ces routes ne sont JAMAIS interceptées.
   */
  const isPublic = 
    pathname.startsWith('/api') || 
    pathname.startsWith('/auth') || 
    pathname.startsWith('/_next') || 
    pathname.startsWith('/images') || 
    pathname.startsWith('/public') || 
    pathname === '/favicon.ico' ||
    pathname === '/';

  if (isPublic) {
    return NextResponse.next();
  }

  /**
   * 2. 🛡️ PROTECTION DES ZONES PRIVÉES
   * On définit les préfixes de routes qui demandent un scellage (Token).
   */
  const privatePrefixes = ['/dashboard', '/admin', '/workspace', '/risks', '/audits', '/ged'];
  const isPrivateRoute = privatePrefixes.some(prefix => pathname.startsWith(prefix));

  if (isPrivateRoute && !token) {
    // Si tentative d'accès privé sans token -> Redirection SAS Login
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('session', 'expired');
    return NextResponse.redirect(loginUrl);
  }

  // 3. CONTINUITÉ POUR TOUT LE RESTE
  return NextResponse.next();
}

/**
 * ⚙️ CONFIGURATION DU MATCHER
 * On exclut les fichiers physiques pour ne pas déclencher le JS du middleware inutilement.
 */
export const config = {
  matcher: [
    /*
     * Match toutes les routes sauf celles contenant un point (fichiers)
     * et les dossiers internes de Next.js.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.).*)',
  ],
};