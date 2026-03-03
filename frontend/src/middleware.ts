/**
 * 🛰️ MODULE : MIDDLEWARE SDE (SOVEREIGN DIGITAL ECOSYSTEM)
 * -------------------------------------------------------------------------
 * RÔLE : Tour de contrôle Edge - Isolation Multi-Tenant & Session Matrix.
 * CORRECTIF : Séparation stricte Master/Tenant & Fix de la boucle de session.
 * -------------------------------------------------------------------------
 * RÉVISION : 02 Mars 2026 | 22:45 GMT
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 📂 ROUTES PUBLIQUES & ASSETS
const PUBLIC_PATHS = ['/api/public', '/images', '/assets', '/favicon.ico', '/robots.txt'];
const AUTH_PATHS = ['/auth/login', '/auth/register', '/auth/forgot-password', '/auth/expired'];

/**
 * 🌍 MATRIX DOMAIN ANALYZER (V2)
 * Résout l'identité du portail avec une priorité Master/Landing.
 */
const getDomainContext = (host: string) => {
  const cleanHost = host.split(':')[0].toLowerCase();
  const parts = cleanHost.split('.');

  // 1. DÉTECTION LANDING / PORTAIL ELITE (elite.qualisoft.sn)
  // On s'assure que 'elite' ne soit pas traité comme un simple client 'Sagam'
  if (parts[0] === 'elite' || cleanHost === 'qualisoft.sn') {
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

  // 4. FALLBACK LOCALHOST (Développement)
  return { slug: 'localhost', type: 'MASTER', isMaster: true };
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || '';
  const context = getDomainContext(host);

  // --- 1. INJECTION DES EN-TÊTES DE CONTEXTE ---
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-tenant-slug', context.slug);
  requestHeaders.set('x-tenant-type', context.type);

  // --- 2. FILTRAGE DES ROUTES LIBRES ---
  const isPublicPath = PUBLIC_PATHS.some(path => pathname.startsWith(path)) || pathname.startsWith('/_next');
  if (isPublicPath) return NextResponse.next({ request: { headers: requestHeaders } });

  // --- 3. LOGIQUE DE SESSION SOUVERAINE ---
  const token = request.cookies.get('qualisoft_token')?.value;
  const isAuthPage = AUTH_PATHS.some(path => pathname.startsWith(path));

  // 🛡️ CAS A : L'utilisateur est connecté et tente d'aller sur /auth/login
  if (isAuthPage && token && !pathname.includes('expired')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // 🛡️ CAS B : L'utilisateur n'est pas connecté sur une route protégée
  if (!isAuthPage && !token) {
    const loginUrl = new URL('/auth/login', request.url);
    
    // Si ce n'est pas la racine, on ajoute le callback
    if (pathname !== '/') {
      loginUrl.searchParams.set('callbackUrl', pathname);
    }
    
    // Ajout de session=expired seulement si on vient d'une page profonde (Dashboard)
    if (pathname.startsWith('/dashboard')) {
      loginUrl.searchParams.set('session', 'expired');
    }

    const response = NextResponse.redirect(loginUrl);
    // On nettoie le token au cas où il serait corrompu/expiré côté client
    response.cookies.delete('qualisoft_token');
    return response;
  }

  // --- 4. RÉPONSE SÉCURISÉE ---
  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  // Sécurité Hardened Matrix
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Empêcher le cache sur le dashboard pour éviter de voir les données Sagam sur Elite via le bouton "Précédent"
  if (pathname.startsWith('/dashboard')) {
    response.headers.set('Cache-Control', 'no-store, max-age=0, must-revalidate');
  }

  return response;
}

export const config = {
  matcher: ['/((?!api/public|_next/static|_next/image|images|assets|favicon.ico|robots.txt).*)'],
};