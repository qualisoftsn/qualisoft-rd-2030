import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * 🛰️ MODULE : MIDDLEWARE SDE (SOVEREIGN DIGITAL ECOSYSTEM)
 * -------------------------------------------------------------------------
 * RÔLE : Tour de contrôle (Edge Routing). Sécurise les accès avant 
 * même que React ne soit chargé. Gère l'aiguillage Multi-Tenant.
 * FIX CRITIQUE : Implémentation du coupe-circuit Anti-Boucle Infinie.
 * -------------------------------------------------------------------------
 * DATE : 02 Mars 2026 | 00:15 GMT
 */

// 📂 Fichiers et routes purement statiques (Le login est retiré d'ici pour traitement spécifique)
const PUBLIC_PATHS = [
  '/api/public',
  '/images',
  '/assets',
  '/favicon.ico',
  '/robots.txt',
];

/**
 * 🌍 DÉTECTEUR DE DOMAINE (Aiguillage Applicatif)
 * Lit le sous-domaine envoyé par Nginx pour définir le comportement du SaaS.
 */
const getDomainContext = (host: string) => {
  const cleanHost = host.split(':')[0].toLowerCase();
  const parts = cleanHost.split('.');

  // 1. CAS LANDING PAGE (La vitrine commerciale du logiciel ISO 9001)
  if (parts[0] === 'elite') {
    return { slug: 'elite', type: 'LANDING', isMaster: false };
  }

  // 2. CAS MASTER (Console d'administration globale Matrix)
  if (parts[0] === 'app' || parts[0] === 'matrix' || parts[0] === 'master') {
    return { slug: 'matrix', type: 'MASTER', isMaster: true };
  }

  // 3. CAS TENANT (Espaces clients isolés ex: sagam.qualisoft.sn)
  // Plus robuste : vérifie juste qu'on est sur un sous-domaine
  if (parts.length >= 2) {
    return { slug: parts[0], type: 'TENANT', isMaster: false };
  }

  // Sécurité par défaut : On le traite comme un Tenant inconnu
  return { slug: 'unknown', type: 'TENANT', isMaster: false };
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 1. LECTURE DES ENTÊTES (Injectées par le Reverse Proxy Nginx)
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || '';
  const context = getDomainContext(host);

  // 2. INJECTION DU CONTEXTE (Pour transmission à page.tsx et aux Server Components)
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-tenant-slug', context.slug);
  requestHeaders.set('x-tenant-type', context.type);
  requestHeaders.set('x-is-master', String(context.isMaster));

  // 3. 🟢 BYPASS N°1 : LA LANDING PAGE
  if (context.type === 'LANDING') {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // 4. 🟢 BYPASS N°2 : LES ROUTES PUBLIQUES (Assets, API publiques)
  const isPublicPath = PUBLIC_PATHS.some(path => 
    pathname === path || pathname.startsWith(path) || pathname.startsWith('/_next')
  );

  if (isPublicPath) {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // 5. 🔴 BARRIÈRE DE SÉCURITÉ & ANTI-BOUCLE (Cœur de l'architecture)
  const token = request.cookies.get('qualisoft_token')?.value;
  const isLoginPage = pathname.startsWith('/auth/login');

  // 🛡️ COUPE-CIRCUIT : Si l'utilisateur A UN TOKEN et tente d'aller sur le Login -> Retour Dashboard
  if (isLoginPage && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // 🟢 Si l'utilisateur n'a PAS de token et va sur le Login -> On le laisse passer
  if (isLoginPage && !token) {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // ⛔ Si l'utilisateur n'a PAS de token et va sur une route protégée -> Expulsion
  if (!token) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    
    const response = NextResponse.redirect(loginUrl);
    // Optionnel mais puissant : On force le nettoyage du cookie corrompu côté navigateur
    response.cookies.delete('qualisoft_token'); 
    
    return response;
  }

  // 6. 🛡️ TRANSMISSION FINALE SÉCURISÉE (Requête valide)
  const response = NextResponse.next({ request: { headers: requestHeaders } });
  
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  
  return response;
}

export const config = {
  // Le middleware s'exécute sur toutes les routes SAUF les fichiers statiques de Next.js
  matcher: ['/((?!_next/static|_next/image|images|assets|favicon.ico|api/public|robots.txt).*)'],
};