import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * 🛰️ MODULE : MIDDLEWARE SDE (SOVEREIGN DIGITAL ECOSYSTEM)
 * -------------------------------------------------------------------------
 * RÔLE : Tour de contrôle Edge. Sécurisation des sessions sans NextAuth.
 * LOGIQUE : Isolation Multi-Tenant par analyse de domaine & Injection d'en-têtes.
 * -------------------------------------------------------------------------
 * DATE : 02 Mars 2026 | 02:49 GMT
 */

// 📂 EXCLUSIONS : Routes totalement libres (Assets & Web-Services publics)
const PUBLIC_PATHS = [
  '/api/public',
  '/images',
  '/assets',
  '/favicon.ico',
  '/robots.txt',
  '/sitemap.xml',
];

/**
 * 🌍 MATRIX DOMAIN ANALYZER
 * Extrait le contexte Tenant directement depuis l'hôte Nginx.
 */
const getDomainContext = (host: string) => {
  const cleanHost = host.split(':')[0].toLowerCase();
  const parts = cleanHost.split('.');

  // 1. LANDING PAGE (Vitrines Commerciales ex: elite.qualisoft.sn)
  if (parts[0] === 'elite') {
    return { slug: 'elite', type: 'LANDING', isMaster: false };
  }

  // 2. MASTER CONSOLE (Console d'administration globale Matrix)
  const masterSubdomains = ['app', 'matrix', 'master', 'admin'];
  if (masterSubdomains.includes(parts[0])) {
    return { slug: 'matrix', type: 'MASTER', isMaster: true };
  }

  // 3. TENANT ISOLÉ (Ex: sagam.qualisoft.sn ou total.sde.sn)
  if (parts.length >= 2) {
    return { slug: parts[0], type: 'TENANT', isMaster: false };
  }

  // 4. FALLBACK SÉCURISÉ
  return { slug: 'unknown', type: 'TENANT', isMaster: false };
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // --- 1. CAPTURE DU CONTEXTE DOMAINE ---
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || '';
  const context = getDomainContext(host);

  // --- 2. PRÉPARATION DES EN-TÊTES SOUVERAINS ---
  // On injecte les données de routage pour que les Server Components sachent où ils sont
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-tenant-slug', context.slug);
  requestHeaders.set('x-tenant-type', context.type);
  requestHeaders.set('x-is-master', String(context.isMaster));

  // --- 3. FILTRAGE DES ROUTES PUBLIQUES ---
  const isPublicPath = PUBLIC_PATHS.some(path => 
    pathname === path || pathname.startsWith(path) || pathname.startsWith('/_next')
  );

  if (isPublicPath || context.type === 'LANDING') {
    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  }

  // --- 4. GESTION SOUVERAINE DES SESSIONS (ANTI-NEXTAUTH) ---
  const token = request.cookies.get('qualisoft_token')?.value;
  const isAuthPage = pathname.startsWith('/auth');

  // 🛡️ COUPE-CIRCUIT N°1 : Utilisateur déjà scellé tentant d'aller sur le Login
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // 🛡️ COUPE-CIRCUIT N°2 : Accès protégé sans jeton Matrix
  if (!isAuthPage && !token) {
    const loginUrl = new URL('/auth/login', request.url);
    
    // On conserve l'intention de l'utilisateur pour redirection après login
    loginUrl.searchParams.set('callbackUrl', pathname);
    
    const response = NextResponse.redirect(loginUrl);
    
    // Nettoyage préventif des traces de cookies corrompus
    response.cookies.delete('qualisoft_token');
    return response;
  }

  // --- 5. VALIDATION & DURCISSEMENT SÉCURITÉ ---
  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  // En-têtes de sécurité "Hardened Matrix"
  response.headers.set('X-Frame-Options', 'DENY'); // Protection Clickjacking
  response.headers.set('X-Content-Type-Options', 'nosniff'); // Protection MIME sniffing
  response.headers.set('X-XSS-Protection', '1; mode=block'); // Protection XSS legacy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Cache control spécifique pour les données sensibles du tableau de bord
  if (pathname.startsWith('/dashboard')) {
    response.headers.set('Cache-Control', 'no-store, max-age=0, must-revalidate');
  }

  return response;
}

/**
 * ⚙️ CONFIGURATION DU MATCHER
 * On exclut les fichiers statiques pour ne pas surcharger le processeur Edge.
 */
export const config = {
  matcher: [
    /*
     * Matcher toutes les routes sauf :
     * 1. api/public (APIs ouvertes)
     * 2. _next/static (Fichiers de build)
     * 3. _next/image (Optimisation d'images)
     * 4. images, assets, favicon.ico (Ressources statiques)
     */
    '/((?!api/public|_next/static|_next/image|images|assets|favicon.ico|robots.txt).*)',
  ],
};