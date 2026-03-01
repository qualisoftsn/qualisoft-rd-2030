/**
 * 🛡️ MIDDLEWARE MATRIX SDE - QUALISOFT ELITE RD 2030
 * -------------------------------------------------------------------------
 * RÔLE : Routage Multi-Tenant Intelligent, Sécurité CSP & Gestion de Session
 * FIX : Séparation stricte Vitrine (qualisoft.sn) vs Elite (elite.qualisoft.sn)
 * -------------------------------------------------------------------------
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 🚀 Chemins totalement publics (Accessibles sans authentification)
const PUBLIC_PATHS = [
  '/auth/login',
  '/api/public',
  '/images',     // Dossier des logos et fonds
  '/assets',
  '/favicon.ico',
  '/robots.txt',
];

// --- LOGIQUE DE DÉTECTION DE L'IDENTITÉ DU DOMAINE ---
const getDomainContext = (host: string) => {
  const cleanHost = host.split(':')[0].toLowerCase();
  const parts = cleanHost.split('.');

  // 1. CAS VITRINE (Landing Page principale)
  if (cleanHost === 'qualisoft.sn' || cleanHost === 'www.qualisoft.sn') {
    return { slug: 'vitrine', type: 'LANDING', isMaster: false };
  }

  // 2. CAS MASTER (Console d'administration Matrix)
  if (parts[0] === 'matrix' || parts[0] === 'elite' || parts[0] === 'admin') {
    return { slug: 'matrix', type: 'MASTER', isMaster: true };
  }

  // 3. CAS TENANT (Clients ex: sagam.qualisoft.sn)
  if (parts.length >= 3 && parts[parts.length - 2] === 'qualisoft') {
    return { slug: parts[0], type: 'TENANT', isMaster: false };
  }

  // Par défaut, retour à la vitrine pour éviter les fuites de sécurité
  return { slug: 'vitrine', type: 'LANDING', isMaster: false };
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get('host') || '';
  const context = getDomainContext(host);

  // 1. GESTION DE LA VITRINE (qualisoft.sn)
  // On laisse passer tout le trafic sur le domaine principal pour la Landing
  if (context.type === 'LANDING') {
    return NextResponse.next();
  }

  // 2. BYPASS DES ROUTES PUBLIQUES POUR LES AUTRES DOMAINES
  const isPublicPath = PUBLIC_PATHS.some(path => 
    pathname === path || pathname.startsWith(path) || pathname.startsWith('/_next')
  );

  if (isPublicPath) {
    return NextResponse.next();
  }

  // 3. VÉRIFICATION DU JETON SOUVERAIN (Anti-NextAuth)
  const token = request.cookies.get('qualisoft_token')?.value;

  // 4. PROTECTION DES ESPACES PRIVÉS (Elite & Tenants)
  if (!token) {
    // Si on essaie d'accéder à la racine d'un sous-domaine (ex: sagam.qualisoft.sn/)
    // on redirige vers le login
    if (pathname === '/' || !isPublicPath) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 5. ISOLATION DES DROITS MASTER
  // Empêcher un utilisateur "Tenant" d'accéder aux routes /admin
  if (pathname.startsWith('/admin') && !context.isMaster) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // 6. SÉCURITÉ ISO 27001 : CSP & HEADERS
  const response = NextResponse.next();
  
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval';
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' data: https://*.qualisoft.sn https://*.ovh.net;
    font-src 'self' https://fonts.gstatic.com;
    connect-src 'self' https://*.qualisoft.sn wss://*.qualisoft.sn;
    frame-ancestors 'none';
    upgrade-insecure-requests;
  `.replace(/\s{2,}/g, ' ').trim();

  response.headers.set('Content-Security-Policy', cspHeader);
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Transmission du contexte aux composants et à l'API via les headers
  response.headers.set('x-tenant-slug', context.slug);
  response.headers.set('x-tenant-type', context.type);
  response.headers.set('x-is-master', String(context.isMaster));

  return response;
}

// --- CONFIGURATION DU MATCHER ---
export const config = {
  matcher: [
    /*
     * Match toutes les routes sauf :
     * 1. Fichiers statiques internes (_next/static, _next/image)
     * 2. Assets publics (images, favicon)
     * 3. API publique
     */
    '/((?!_next/static|_next/image|images|assets|favicon.ico|api/public).*)',
  ],
};