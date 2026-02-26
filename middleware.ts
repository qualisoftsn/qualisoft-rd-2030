// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_ROUTES = [
  '/login',
  '/api/auth/login',
  '/api/auth/refresh',
  '/api/public/tenants',
  '/_next',
  '/favicon.ico',
];

// ✅ DÉTECTION DU TENANT VIA SOUS-DOMAINE (OVH)
const extractTenantFromHost = (host: string): { slug: string; isMaster: boolean } => {
  const parts = host.split('.');
  
  // Cas MASTER : matrix.qualisoft.sn OU www.qualisoft.sn (redirige vers matrix)
  if (parts[0] === 'matrix' || parts[0] === 'www') {
    return { slug: 'matrix', isMaster: true };
  }
  
  // Cas Tenant : sagam.qualisoft.sn → slug = "sagam"
  if (parts.length > 2 && parts[1] === 'qualisoft' && parts[2] === 'sn') {
    return { slug: parts[0], isMaster: false };
  }
  
  // Fallback : domaine racine (redirige vers www)
  return { slug: 'www', isMaster: true };
};

export async function middleware(request: NextRequest) {
  const { pathname, host } = request.nextUrl;
  const { slug: currentSlug, isMaster: isMasterNode } = extractTenantFromHost(host);

  // ✅ SKIP POUR ROUTES PUBLIQUES
  if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // ✅ VÉRIFICATION DU REFRESH TOKEN (COOKIE HTTPONLY)
  const refreshToken = request.cookies.get('refresh_token');
  
  if (!refreshToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ✅ CSP STRICT ADAPTÉE À L'INFRASTRUCTURE OVH
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' https://www.googletagmanager.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' data: https://*.qualisoft.sn https://*.ovh.net;
    font-src 'self' https://fonts.gstatic.com;
    connect-src 'self' https://*.qualisoft.sn https://*.ovh.net https://api.qualisoft.sn;
    frame-src 'none';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    upgrade-insecure-requests;
  `.replace(/\s{2,}/g, ' ').trim();

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('Content-Security-Policy', cspHeader);
  requestHeaders.set('X-Frame-Options', 'DENY');
  requestHeaders.set('X-Content-Type-Options', 'nosniff');
  requestHeaders.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  requestHeaders.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  // ✅ REDIRECTION INTELLIGENTE ENTRE SOUS-DOMAINES
  // Ex: Accès à /dashboard sur www.qualisoft.sn → redirige vers matrix.qualisoft.sn
  if (pathname.startsWith('/dashboard') && !isMasterNode) {
    const matrixUrl = new URL(`https://matrix.qualisoft.sn${pathname}`);
    return NextResponse.redirect(matrixUrl, { headers: requestHeaders });
  }

  // Ex: Accès Matrix depuis un sous-domaine client → redirige vers matrix.qualisoft.sn
  if (pathname.startsWith('/admin') && !isMasterNode) {
    const matrixUrl = new URL(`https://matrix.qualisoft.sn${pathname}`);
    return NextResponse.redirect(matrixUrl, { headers: requestHeaders });
  }

  return NextResponse.next({ headers: requestHeaders });
}

export const config = {
  matcher: [
    '/((?!api/auth/login|api/auth/refresh|api/public/tenants|_next/static|_next/image|favicon.ico).*)',
    '/dashboard/:path*',
    '/admin/:path*',
  ],
};