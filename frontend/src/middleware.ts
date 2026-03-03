/**
 * 🛰️ MODULE : middleware.ts (SENTINELLE MATRIX)
 * -------------------------------------------------------------------------
 * RÉPARATION : Suppression du blocage infini sur elite.qualisoft.sn.
 * RÉVISION : 03 Mars 2026 | 18:15 GMT
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/api/public', '/images', '/assets', '/favicon.ico', '/robots.txt'];
const AUTH_PATHS = ['/auth/login', '/auth/register', '/auth/forgot-password', '/auth/expired'];

const getDomainContext = (host: string) => {
  const cleanHost = host.split(':')[0].toLowerCase();
  const parts = cleanHost.split('.');

  if (parts[0] === 'elite' || cleanHost === 'qualisoft.sn' || cleanHost === 'www.qualisoft.sn') {
    return { slug: 'elite', type: 'LANDING' };
  }

  const masterSubdomains = ['app', 'matrix', 'master', 'admin'];
  if (masterSubdomains.includes(parts[0])) {
    return { slug: 'matrix', type: 'MASTER' };
  }

  if (parts.length >= 3) {
    return { slug: parts[0], type: 'TENANT' };
  }

  return { slug: 'localhost', type: 'MASTER' };
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get('host') || '';
  const context = getDomainContext(host);
  const token = request.cookies.get('qualisoft_token')?.value;

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-tenant-slug', context.slug);
  requestHeaders.set('x-tenant-type', context.type);

  // 1. Assets publics (Libre passage)
  if (PUBLIC_PATHS.some(path => pathname.startsWith(path)) || pathname.startsWith('/_next')) {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  const isAuthPage = AUTH_PATHS.some(path => pathname.startsWith(path));
  const isDashboardRoute = pathname.startsWith('/dashboard');

  // 🛡️ CAS A : Utilisateur connecté sur une page Auth -> Vers Dashboard
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // 🛡️ CAS B : Route protégée sans Token -> Login
  if (isDashboardRoute && !token) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('session', 'expired');
    loginUrl.searchParams.set('callbackUrl', pathname);
    
    const response = NextResponse.redirect(loginUrl);
    // ✅ ÉLIMINATION DÉFINITIVE NEXTAUTH
    response.cookies.delete('next-auth.session-token');
    return response;
  }

  const response = NextResponse.next({ request: { headers: requestHeaders } });

  // Sécurité Hardened
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  
  if (isDashboardRoute) {
    response.headers.set('Cache-Control', 'no-store, max-age=0, must-revalidate');
  }

  return response;
}

export const config = {
  matcher: ['/((?!api/public|_next/static|_next/image|images|assets|favicon.ico|robots.txt).*)'],
};