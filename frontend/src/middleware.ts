import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get('host') || '';
  
  // 1. Détection du sous-domaine
  // elite.qualisoft.sn -> elite
  // sde.qualisoft.sn -> sde
  const subdomain = hostname.split('.')[0];

  // 2. Sécurisation du Portail Master
  if (subdomain === 'elite') {
    const token = request.cookies.get('auth-token'); // Ajuste selon ton nom de cookie
    
    // Si on est sur elite et pas de token -> vers le login
    if (!token && !url.pathname.startsWith('/auth')) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
    
    // Ici on pourrait ajouter une vérification de rôle via le JWT si nécessaire
  }

  // 3. Injection du sous-domaine dans les headers pour les pages
  const response = NextResponse.next();
  response.headers.set('x-qualisoft-tenant', subdomain);
  
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};