/**
 * 🛡️ MIDDLEWARE MATRIX SDE - QUALISOFT ELITE RD 2030
 * -------------------------------------------------------------------------
 * RÔLE : Routage Multi-Tenant, Sécurité Périmétrale & Gestion de Session.
 * DOMAINES : 
 * - Vitrine : qualisoft.sn (Accès libre)
 * - Master  : elite.qualisoft.sn (Console Admin)
 * - Tenants : *.qualisoft.sn (Portails Clients)
 * -------------------------------------------------------------------------
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 🚀 Chemins accessibles sans jeton qualisoft_token
const PUBLIC_PATHS = [
  '/auth/login',
  '/api/public',
  '/images',     // Dossier des logos (important pour l'affichage)
  '/assets',
  '/favicon.ico',
  '/robots.txt',
];

/**
 * Analyse l'hôte (URL) pour déterminer le contexte de navigation.
 */
const getDomainContext = (host: string) => {
  const cleanHost = host.split(':')[0].toLowerCase();
  const parts = cleanHost.split('.');

  // 1. 🌐 CAS VITRINE : Le site institutionnel (qualisoft.sn)
  // On vérifie l'exactitude du domaine racine.
  if (cleanHost === 'qualisoft.sn' || cleanHost === 'www.qualisoft.sn') {
    return { slug: 'vitrine', type: 'LANDING', isMaster: false };
  }

  // 2. 👑 CAS MASTER : La console souveraine (elite.qualisoft.sn)
  if (parts[0] === 'matrix' || parts[0] === 'elite' || parts[0] === 'admin') {
    return { slug: 'matrix', type: 'MASTER', isMaster: true };
  }

  // 3. 🏢 CAS TENANT : Les instances clients (ex: sagam.qualisoft.sn)
  // On s'assure qu'on est bien sur un sous-domaine de qualisoft.sn
  if (parts.length >= 3 && parts.includes('qualisoft')) {
    return { slug: parts[0], type: 'TENANT', isMaster: false };
  }

  // Sécurité : par défaut, on considère que c'est la vitrine pour ne pas bloquer l'accès
  return { slug: 'vitrine', type: 'LANDING', isMaster: false };
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get('host') || '';
  const context = getDomainContext(host);

  // --- ÉTAPE 1 : PRIORITÉ VITRINE ---
  // Si nous sommes sur qualisoft.sn, on laisse passer sans aucune restriction.
  if (context.type === 'LANDING') {
    return NextResponse.next();
  }

  // --- ÉTAPE 2 : GESTION DES CHEMINS PUBLICS ---
  // On autorise l'accès aux images et au login même sur les sous-domaines.
  const isPublicPath = PUBLIC_PATHS.some(path => 
    pathname === path || pathname.startsWith(path) || pathname.startsWith('/_next')
  );

  if (isPublicPath) {
    return NextResponse.next();
  }

  // --- ÉTAPE 3 : VÉRIFICATION DE LA SESSION (TOKEN SDE) ---
  const token = request.cookies.get('qualisoft_token')?.value;

  // Si aucun token n'est présent sur un espace privé (Elite ou Tenant)
  if (!token) {
    const loginUrl = new URL('/auth/login', request.url);
    // On garde en mémoire la page demandée pour y revenir après connexion
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // --- ÉTAPE 4 : SÉCURITÉ ISO 27001 (HEADERS & CSP) ---
  const response = NextResponse.next();
  
  // Configuration de la politique de sécurité du contenu
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

  // Application des headers de sécurité souverains
  response.headers.set('Content-Security-Policy', cspHeader);
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

  // --- ÉTAPE 5 : INJECTION DU CONTEXTE ---
  // On transmet les informations du Tenant via les headers pour que 
  // les Server Components puissent les lire sans recalculer le domaine.
  response.headers.set('x-tenant-slug', context.slug);
  response.headers.set('x-tenant-type', context.type);
  response.headers.set('x-is-master', String(context.isMaster));

  return response;
}

// --- CONFIGURATION DU FILTRE (MATCHER) ---
export const config = {
  matcher: [
    /*
     * On exécute le middleware sur toutes les routes excepté :
     * 1. Le dossier interne Next.js (_next/static, _next/image)
     * 2. Les fichiers statiques racines (favicon, robots)
     * 3. Le dossier /images (logos publics)
     */
    '/((?!_next/static|_next/image|images|assets|favicon.ico|api/public|robots.txt).*)',
  ],
};