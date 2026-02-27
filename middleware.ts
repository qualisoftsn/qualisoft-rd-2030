/**
 * 🛡️ MIDDLEWARE MATRIX SDE - QUALISOFT ELITE
 * -------------------------------------------------------------------------
 * RÔLE : Sécurité périmétrale & Gestion de Session HttpOnly
 * -------------------------------------------------------------------------
 */

// Utilisation d'un import explicite pour éviter les conflits de résolution d'IDE
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = [
  '/login',
  '/api/trial/request',
  '/api/trial/verify',
  '/_next',
  '/favicon.ico',
];

// --- LOGIQUE DE DÉTECTION DU TENANT (DNS OVH) ---
const getTenantInfo = (host: string) => {
  const parts = host.split('.');
  // Cas MASTER (matrix ou www)
  if (parts[0] === 'matrix' || parts[0] === 'www') {
    return { slug: 'matrix', isMaster: true };
  }
  // Cas CLIENT (ex: sagam.qualisoft.sn)
  if (parts.length >= 3 && parts[1] === 'qualisoft') {
    return { slug: parts[0], isMaster: false };
  }
  return { slug: 'matrix', isMaster: true };
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get('host') || '';
  const { isMaster } = getTenantInfo(host);

  // 1. SKIP POUR LES ROUTES PUBLIQUES
  if (PUBLIC_PATHS.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // 2. RÉCUPÉRATION DES SESSIONS MATRIX (Cookies HttpOnly)
  const tenantId = request.cookies.get('qualisoft_tenant_id')?.value;
  const userId = request.cookies.get('qualisoft_user_id')?.value;

  // 3. REDIRECTION SI NON AUTHENTIFIÉ
  if (!tenantId || !userId) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 4. SÉCURITÉ : CSP & HEADERS (Optimisé OVH/Docker)
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' data: https://*.qualisoft.sn https://*.ovh.net;
    font-src 'self' https://fonts.gstatic.com;
    connect-src 'self' https://*.qualisoft.sn https://*.ovh.net;
    frame-ancestors 'none';
    upgrade-insecure-requests;
  `.replace(/\s{2,}/g, ' ').trim();

  // Création de la réponse avec les headers
  const response = NextResponse.next();
  
  // Injection des headers de sécurité ISO 27001
  response.headers.set('Content-Security-Policy', cspHeader);
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

  // 5. LOGIQUE DE ROUTAGE INTER-DOMAINES
  if (pathname.startsWith('/admin') && !isMaster) {
    const matrixUrl = new URL(`https://matrix.qualisoft.sn${pathname}`);
    return NextResponse.redirect(matrixUrl);
  }

  return response;
}

// --- CONFIGURATION DU MATCHER ---
export const config = {
  matcher: [
    /*
     * Matcher toutes les routes sauf celles exclues explicitement
     */
    '/((?!api/trial/request|api/trial/verify|_next/static|_next/image|favicon.ico|login).*)',
    '/dashboard/:path*',
    '/admin/:path*',
  ],
};