/**
 * 🛡️ MODULE : SDE KERNEL PROXY (SÉCURITÉ ABSOLUE)
 * -------------------------------------------------------------------------
 * RÔLE : Sentinelle de périmètre du Matrix OS.
 * FONCTION : Whitelist des flux publics & Verrouillage du Dashboard.
 * RÉVISION : 07 Mars 2026 | 14:45 GMT
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
   * On autorise explicitement ces routes pour éviter les 404 sur sous-domaines.
   * On ajoute '/external' pour tes enquêtes publiques §9.1.2.
   */
  const isPublicResource = 
    pathname.startsWith('/api') || 
    pathname.startsWith('/auth') || 
    pathname.startsWith('/external') || 
    pathname.startsWith('/_next') || 
    pathname.startsWith('/images') || 
    pathname.startsWith('/public') || 
    pathname === '/favicon.ico' ||
    pathname === '/';

  if (isPublicResource) {
    return NextResponse.next();
  }

  /**
   * 2. 🛡️ PROTECTION DU PÉRIMÈTRE PRIVÉ (RBAC FRONTEND)
   * On définit les zones qui exigent un scellage de session actif.
   */
  const privatePrefixes = ['/dashboard', '/admin', '/workspace', '/risks', '/audits'];
  const isPrivateRoute = privatePrefixes.some(prefix => pathname.startsWith(prefix));

  if (isPrivateRoute && !token) {
    // 🚧 ÉJECTION PROPRE : Redirection vers le SAS Login avec flag d'expiration
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('session', 'expired');
    
    return NextResponse.redirect(loginUrl);
  }

  // 3. CONTINUITÉ DU FLUX POUR LE RESTE (LAYOUTS, ETC.)
  return NextResponse.next();
}

/**
 * ⚙️ CONFIGURATION DU MATCHER (PRÉCISION MATRIX)
 * On exclut les fichiers statiques physiques pour économiser les ressources serveur.
 */
export const config = {
  matcher: [
    /*
     * Match toutes les routes sauf celles contenant un point (fichiers)
     * et les répertoires internes de Next.js.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.).*)',
  ],
};