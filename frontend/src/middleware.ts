/**
 * 🛰️ MODULE : middleware.ts (SENTINELLE MATRIX)
 * -------------------------------------------------------------------------
 * RÔLE : Isolation des contextes (Landing vs Master vs Tenant).
 * FIX : Libération de la racine '/' pour l'affichage de la Landing Page.
 * RÉVISION : 03 Mars 2026 | 02:20 GMT
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 📂 ZONES DE LIBRE PASSAGE (Public & Assets)
const PUBLIC_PATHS = ['/api/public', '/images', '/assets', '/favicon.ico', '/robots.txt'];
const AUTH_PATHS = ['/auth/login', '/auth/register', '/auth/forgot-password', '/auth/expired'];

/**
 * 🌍 MATRIX DOMAIN ANALYZER
 * Détermine si nous sommes sur le Portail Elite, la Console Master ou un Client.
 */
const getDomainContext = (host: string) => {
  const cleanHost = host.split(':')[0].toLowerCase();
  const parts = cleanHost.split('.');

  // 1. DÉTECTION PORTAIL ELITE / LANDING (Ex: elite.qualisoft.sn ou qualisoft.sn)
  if (parts[0] === 'elite' || cleanHost === 'qualisoft.sn' || cleanHost === 'www.qualisoft.sn') {
    return { slug: 'elite', type: 'LANDING', isMaster: false };
  }

  // 2. MASTER CONSOLE (admin.qualisoft.sn, matrix.qualisoft.sn)
  const masterSubdomains = ['app', 'matrix', 'master', 'admin'];
  if (masterSubdomains.includes(parts[0])) {
    return { slug: 'matrix', type: 'MASTER', isMaster: true };
  }

  // 3. TENANT ISOLÉ (Ex: sagam.qualisoft.sn)
  if (parts.length >= 3) {
    return { slug: parts[0], type: 'TENANT', isMaster: false };
  }

  // 4. FALLBACK DEV (Localhost)
  return { slug: 'localhost', type: 'MASTER', isMaster: true };
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || '';
  const context = getDomainContext(host);
  const token = request.cookies.get('qualisoft_token')?.value;

  // --- 1. INJECTION DES EN-TÊTES (Pour le serveur de composants) ---
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-tenant-slug', context.slug);
  requestHeaders.set('x-tenant-type', context.type);

  // --- 2. FILTRAGE DES FLUX ASSETS (Libération totale) ---
  const isPublicAsset = PUBLIC_PATHS.some(path => pathname.startsWith(path)) || pathname.startsWith('/_next');
  if (isPublicAsset) {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // --- 3. LOGIQUE D'AIGUILLAGE SOUVERAINE ---
  const isAuthPage = AUTH_PATHS.some(path => pathname.startsWith(path));
  const isLandingPage = pathname === '/';

  // 🛡️ CAS A : L'utilisateur est sur la Landing Page (Toujours autoriser)
  // On ne redirige plus la racine '/' si !token
  if (isLandingPage && !token) {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // 🛡️ CAS B : Déjà connecté -> On évite le Login inutile
  if (isAuthPage && token && !pathname.includes('expired')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // 🛡️ CAS C : Accès privé sans badge (Uniquement pour Dashboard et Master Console)
  const isProtectedRoute = pathname.startsWith('/dashboard') || (context.type === 'MASTER' && pathname !== '/');
  
  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/auth/login', request.url);
    
    // On garde l'aiguillage si l'utilisateur venait d'une page profonde
    if (pathname !== '/') {
      loginUrl.searchParams.set('callbackUrl', pathname);
    }
    
    // On signale l'expiration de session si c'était le cas
    if (pathname.startsWith('/dashboard')) {
      loginUrl.searchParams.set('session', 'expired');
    }

    const response = NextResponse.redirect(loginUrl);
    // Nettoyage radical des résidus NextAuth potentiels
    response.cookies.delete('next-auth.session-token'); 
    return response;
  }

  // --- 4. RÉPONSE SÉCURISÉE SDE ---
  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  // Headers de durcissement (Hardened)
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  
  // Anti-Leakage de données entre Tenants via le cache navigateur
  if (pathname.startsWith('/dashboard')) {
    response.headers.set('Cache-Control', 'no-store, max-age=0, must-revalidate');
  }

  return response;
}

export const config = {
  // On capture tout sauf les fichiers statiques explicites
  matcher: ['/((?!api/public|_next/static|_next/image|images|assets|favicon.ico|robots.txt).*)'],
};