import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = [
  '/auth/login',
  '/api/public',
  '/images',
  '/assets',
  '/favicon.ico',
  '/robots.txt',
];

const getDomainContext = (host: string) => {
  const cleanHost = host.split(':')[0].toLowerCase();
  const parts = cleanHost.split('.');

  // 1. VITRINE
  if (cleanHost === 'qualisoft.sn' || cleanHost === 'www.qualisoft.sn') {
    return { slug: 'vitrine', type: 'LANDING', isMaster: false };
  }

  // 2. MASTER
  if (parts[0] === 'matrix' || parts[0] === 'elite' || parts[0] === 'admin') {
    return { slug: 'matrix', type: 'MASTER', isMaster: true };
  }

  // 3. TENANT
  if (parts.length >= 3 && parts.includes('qualisoft')) {
    return { slug: parts[0], type: 'TENANT', isMaster: false };
  }

  return { slug: 'vitrine', type: 'LANDING', isMaster: false };
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 🚩 CORRECTION DOCKER : Lire l'entête Nginx prioritairement
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || '';
  const context = getDomainContext(host);

  // 🚩 CORRECTION NEXT.JS APP ROUTER : Cloner la requête pour transmettre à page.tsx
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-tenant-slug', context.slug);
  requestHeaders.set('x-tenant-type', context.type);
  requestHeaders.set('x-is-master', String(context.isMaster));

  // 1. GESTION VITRINE (Passage direct)
  if (context.type === 'LANDING') {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // 2. BYPASS DES ROUTES PUBLIQUES
  const isPublicPath = PUBLIC_PATHS.some(path => 
    pathname === path || pathname.startsWith(path) || pathname.startsWith('/_next')
  );

  if (isPublicPath) {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // 3. VÉRIFICATION DU JETON SOUVERAIN
  const token = request.cookies.get('qualisoft_token')?.value;

  if (!token) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 4. SÉCURITÉ ET TRANSMISSION FINALE
  const response = NextResponse.next({ request: { headers: requestHeaders } });
  
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|images|assets|favicon.ico|api/public|robots.txt).*)'],
};