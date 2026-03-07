/**
 * 🛰️ MODULE : SDE KERNEL PROXY (ELITE-SDE)
 * -------------------------------------------------------------------------
 * RÔLE : Sentinelle Frontend - Isolation stricte des flux API & Assets.
 * FIX : Protection contre l'interception des appels API sur subdomains.
 * RÉVISION : 07 Mars 2026 | 03:50 GMT
 * -------------------------------------------------------------------------
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 🔍 RÉCUPÉRATION DU TOKEN SÉCURISÉ (Backend NestJS HttpOnly)
  const token = request.cookies.get('access_token')?.value;

  /**
   * 1. 🏳️ ZONE DE LIBRE PASSAGE (WHITELIST)
   * On autorise explicitement ces routes sans aucune vérification.
   * On ajoute '/api' en priorité pour éviter que Axios reçoive du HTML.
   */
  const isPublicResource = 
    pathname.startsWith('/api') || 
    pathname.startsWith('/auth') || 
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
   * Seules ces routes déclenchent une redirection vers le login.
   */
  const privateRoutes = ['/dashboard', '/admin', '/workspace', '/risks', '/audits'];
  const isPrivateRoute = privateRoutes.some(route => pathname.startsWith(route));

  if (isPrivateRoute && !token) {
    // 🚧 On capture l'URL d'origine pour redirection post-login (optionnel)
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('session', 'expired');
    
    return NextResponse.redirect(loginUrl);
  }

  // 3. CONTINUITÉ DU FLUX POUR TOUT LE RESTE
  return NextResponse.next();
}

/**
 * ⚙️ CONFIGURATION DU MATCHER (PRÉCISION CHIRURGICALE)
 * On exclut les fichiers statiques pour ne pas surcharger le CPU du serveur.
 */
export const config = {
  matcher: [
    /*
     * Match toutes les routes sauf :
     * 1. api (géré manuellement à l'intérieur pour plus de sécurité)
     * 2. _next/static (fichiers statiques)
     * 3. _next/image (optimisation d'images)
     * 4. favicon.ico (icône navigateur)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};