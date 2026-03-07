/**
 * 🛰️ MODULE : SDE KERNEL PROXY (ELITE-SDE)
 * -------------------------------------------------------------------------
 * RÔLE : Sentinelle Frontend & Isolation des Tunnels Publics.
 * RÉVISION : 07 Mars 2026 | 03:05 GMT
 * -------------------------------------------------------------------------
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('access_token')?.value;

  // 1. 🏳️ LISTE BLANCHE ABSOLUE (Zéro interception)
  // On inclut les assets, les images, le dossier public et TOUTES les routes d'auth
  if (
    pathname.startsWith('/_next') || 
    pathname.startsWith('/images') || 
    pathname.startsWith('/api/public') || 
    pathname.startsWith('/auth') ||
    pathname.startsWith('/external') || // Nouveau nom pour public/
    pathname === '/'
  ) {
    return NextResponse.next();
  }

  // 2. 🛡️ PROTECTION DU PÉRIMÈTRE PRIVÉ
  // Si on essaie d'accéder à une zone sensible sans token
  const isPrivateArea = pathname.startsWith('/dashboard') || pathname.startsWith('/admin') || pathname.startsWith('/workspace');
  
  if (isPrivateArea && !token) {
    const url = request.nextUrl.clone();
    url.pathname = '/auth/login';
    url.searchParams.set('session', 'expired');
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // On exclut les fichiers statiques de base pour booster les performances
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};