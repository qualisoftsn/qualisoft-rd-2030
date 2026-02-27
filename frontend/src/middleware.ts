/**
 * 🛡️ MIDDLEWARE MATRIX SDE - QUALISOFT ELITE
 * -------------------------------------------------------------------------
 * RÔLE : Sécurité périmétrale, Routage Multi-Tenant & Session JWT
 * FIX : Autorisation de la racine (Landing Page) & Gestion des domaines
 * -------------------------------------------------------------------------
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 🚀 Routes exemptées de la vérification du token JWT
const PUBLIC_PATHS = [
  '/',                  // ✅ FIX : La Landing Page doit être publique
  '/auth/login',        // Page de connexion Elite
  '/api/trial/request',
  '/api/trial/verify',
  '/assets',            // Dossier des logos
  '/favicon.ico',
];

// --- LOGIQUE DE DÉTECTION DU TENANT (DNS OVH WILDCARD) ---
const getTenantInfo = (host: string) => {
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
  
  return { slug: 'matrix', isMaster: true };
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get('host') || '';
  const { isMaster, slug } = getTenantInfo(host);

  // 1. BYPASS POUR LES ROUTES PUBLIQUES
  // On vérifie si le chemin exact est dans PUBLIC_PATHS ou s'il commence par un dossier public
  const isPublic = PUBLIC_PATHS.some(path => 
    pathname === path || pathname.startsWith('/_next') || pathname.startsWith('/assets')
  );

  if (isPublic) {
    return NextResponse.next();
  }

  // 2. RÉCUPÉRATION DU JETON SOUVERAIN
  const token = request.cookies.get('qualisoft_token')?.value;

  // 3. REDIRECTION SÉCURISÉE SI NON AUTHENTIFIÉ
  // On ne redirige vers le login QUE si l'utilisateur n'est pas sur une route publique
  if (!token) {
    const loginUrl = new URL('/auth/login', request.url);
    // On évite de boucler si on est déjà sur le login
    if (pathname !== '/auth/login') {
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 4. SÉCURITÉ ISO 27001 : CSP & HEADERS
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

  const response = NextResponse.next();
  
  response.headers.set('Content-Security-Policy', cspHeader);
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

  // 5. ISOLATION DES ROUTES MASTER
  if (pathname.startsWith('/admin') && !isMaster) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // 6. TRANSMISSION DU CONTEXTE AU HEADER
  response.headers.set('x-tenant-slug', slug);
  response.headers.set('x-is-master', String(isMaster));

  return response;
}

// --- CONFIGURATION DU MATCHER ---
export const config = {
  matcher: [
    /*
     * Exécute le middleware sur tout sauf les fichiers statiques internes
     */
    '/((?!_next/static|_next/image|assets|favicon.ico|api/public).*)',
  ],
};