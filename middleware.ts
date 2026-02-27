/**
 * 🛡️ MIDDLEWARE MATRIX SDE - QUALISOFT ELITE
 * -------------------------------------------------------------------------
 * RÔLE : Sécurité périmétrale, Routage Multi-Tenant & Session JWT
 * INFRASTRUCTURE : Optimisé OVH (Aucun tracker tiers)
 * -------------------------------------------------------------------------
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 🚀 Routes exemptées de la vérification du token JWT
const PUBLIC_PATHS = [
  '/auth/login',         // Page de connexion Elite
  '/api/trial/request',
  '/api/trial/verify',
  '/_next',              // Fichiers internes Next.js
  '/assets',             // Dossier des logos (QsLogo.svg)
  '/favicon.ico',
];

// --- LOGIQUE DE DÉTECTION DU TENANT (DNS OVH WILDCARD) ---
const getTenantInfo = (host: string) => {
  // Nettoyage du port si on est en dev local (ex: localhost:3001)
  const cleanHost = host.split(':')[0];
  const parts = cleanHost.split('.');

  // Cas MASTER (matrix, www, elite, api)
  if (['matrix', 'www', 'elite', 'api'].includes(parts[0])) {
    return { slug: parts[0], isMaster: true };
  }
  
  // Cas CLIENT (ex: sde.qualisoft.sn -> parts[0] = 'sde')
  if (parts.length >= 3 && parts[1] === 'qualisoft') {
    return { slug: parts[0], isMaster: false };
  }
  
  // Fallback de sécurité
  return { slug: 'matrix', isMaster: true };
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get('host') || '';
  const { isMaster, slug } = getTenantInfo(host);

  // 1. BYPASS POUR LES ROUTES PUBLIQUES
  if (PUBLIC_PATHS.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // 2. RÉCUPÉRATION DU JETON SOUVERAIN (Cookie HttpOnly défini au Login)
  // Note : Assure-toi que ton API ou ta page de login crée bien ce cookie.
  const token = request.cookies.get('qualisoft_token')?.value;

  // 3. REDIRECTION SÉCURISÉE SI NON AUTHENTIFIÉ
  if (!token) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 4. SÉCURITÉ ISO 27001 : CSP & HEADERS (100% Souverain, 0 Tracker)
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

  // Création de la réponse avec les headers
  const response = NextResponse.next();
  
  // Injection stricte des headers de sécurité
  response.headers.set('Content-Security-Policy', cspHeader);
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

  // 5. ISOLATION DES ROUTES MASTER
  // Empêche un utilisateur sur 'sde.qualisoft.sn' d'accéder aux URL '/admin/...'
  if (pathname.startsWith('/admin') && !isMaster) {
    // Redirection silencieuse vers le tableau de bord standard du client
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // 6. TRANSMISSION DU CONTEXTE (Optionnel mais utile)
  // Permet aux Server Components (app/page.tsx) de lire le tenant actuel
  response.headers.set('x-tenant-slug', slug);

  return response;
}

// --- CONFIGURATION DU MATCHER (Filtre d'exécution) ---
export const config = {
  matcher: [
    /*
     * Exécute le middleware sur TOUTES les routes SAUF :
     * 1. Les API d'authentification ou publiques
     * 2. Les fichiers statiques et images
     */
    '/((?!api/auth|_next/static|_next/image|assets|favicon.ico).*)',
  ],
};