/* eslint-disable @typescript-eslint/no-unused-vars */
import { jwtVerify } from 'jose';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// Routes statiques et publiques
const PUBLIC_ROUTES = ['/', '/essai', '/essai/expire', '/auth/login', '/auth/register'];

// 🟢 CORRECTION : On autorise TOUT le segment /api/auth pour NextAuth
const API_PUBLIC_PREFIXES = ['/api/auth', '/api/trial/request', '/api/trial/verify'];

const JWT_SECRET = process.env.JWT_SECRET || 'votre_cle_secrete_de_secours';
const TRIAL_SECRET = process.env.TRIAL_JWT_SECRET || 'trial-secret-key-min-32-characters-for-qualisoft';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  // 1. GESTION DES ROUTES API
  if (pathname.startsWith('/api/')) {
    
    // Autoriser les options pour le pre-flight CORS
    if (request.method === 'OPTIONS') {
      const optResponse = new NextResponse(null, { status: 204 });
      optResponse.headers.set('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*');
      optResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
      optResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-tenant-id');
      optResponse.headers.set('Access-Control-Allow-Credentials', 'true');
      return optResponse;
    }

    // Vérifier si la route API est publique par son préfixe
    const isPublicApi = API_PUBLIC_PREFIXES.some(prefix => pathname.startsWith(prefix));

    if (!isPublicApi) {
      const authHeader = request.headers.get('authorization');
      
      // Si on n'a pas de token Bearer sur une route API privée -> 401
      if (!authHeader?.startsWith('Bearer ')) {
        return NextResponse.json(
          { error: 'Accès non autorisé : Token manquant' }, 
          { status: 401 }
        );
      }
    }

    return response;
  }

  // 2. ROUTES PUBLIQUES STATIQUES
  if (
    PUBLIC_ROUTES.includes(pathname) || 
    pathname.startsWith('/_next/') || 
    pathname.startsWith('/static/') ||
    pathname.includes('.')
  ) {
    return response;
  }

  // 3. PROTECTION TRIAL
  if (pathname.startsWith('/trial/')) {
    const trialToken = request.cookies.get('trial_token')?.value;
    
    if (!trialToken) {
      return NextResponse.redirect(new URL('/essai', request.url));
    }

    try {
      const secret = new TextEncoder().encode(TRIAL_SECRET);
      const { payload } = await jwtVerify(trialToken, secret);
      
      const exp = payload.exp as number;
      if (Date.now() >= exp * 1000) {
        const redirect = NextResponse.redirect(new URL('/essai/expire', request.url));
        redirect.cookies.delete('trial_token');
        return redirect;
      }

      const res = NextResponse.next();
      res.headers.set('x-user-type', 'trial');
      res.headers.set('x-tenant-id', payload.tenantId as string);
      return res;
      
    } catch (error) {
      return NextResponse.redirect(new URL('/essai', request.url));
    }
  }

  // 4. ROUTES DASHBOARD / ADMIN
  // On laisse passer car le contrôle final est dans useAuthStore (Client-side)
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) {
    return response;
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (handled in middleware)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};