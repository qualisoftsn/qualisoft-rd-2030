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

  // 1. CAS MASTER (Console d'administration Matrix)
  if (parts[0] === 'matrix' || parts[0] === 'elite' || parts[0] === 'admin') {
    return { slug: 'matrix', type: 'MASTER', isMaster: true };
  }

  // 2. CAS TENANT (Clients ex: sagam.qualisoft.sn)
  if (parts.length >= 3 && parts.includes('qualisoft')) {
    return { slug: parts[0], type: 'TENANT', isMaster: false };
  }

  // Sécurité : Par défaut on le traite comme un Tenant inconnu
  return { slug: 'unknown', type: 'TENANT', isMaster: false };
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Lecture des entêtes injectées par Nginx
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || '';
  const context = getDomainContext(host);

  // Injection du contexte pour les Server Components (page.tsx)
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-tenant-slug', context.slug);
  requestHeaders.set('x-tenant-type', context.type);
  requestHeaders.set('x-is-master', String(context.isMaster));

  // BYPASS DES ROUTES PUBLIQUES
  const isPublicPath = PUBLIC_PATHS.some(path => 
    pathname === path || pathname.startsWith(path) || pathname.startsWith('/_next')
  );

  if (isPublicPath) {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // VÉRIFICATION DU JETON SOUVERAIN (Cœur de la sécurité)
  const token = request.cookies.get('qualisoft_token')?.value;

  // S'il n'y a pas de jeton, on verrouille l'accès et on envoie au Login
  if (!token) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // SÉCURITÉ ET TRANSMISSION FINALE
  const response = NextResponse.next({ request: { headers: requestHeaders } });
  
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|images|assets|favicon.ico|api/public|robots.txt).*)'],
};