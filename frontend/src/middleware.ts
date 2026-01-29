// File: frontend/src/middleware.ts
/* eslint-disable @typescript-eslint/no-unused-vars */
import { jwtVerify } from 'jose';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const PUBLIC_ROUTES = ['/', '/essai', '/essai/expire', '/auth/login', '/auth/register'];
const API_PUBLIC_ROUTES = ['/api/auth/login', '/api/auth/register', '/api/trial/request', '/api/trial/verify'];

const JWT_SECRET = process.env.JWT_SECRET || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVX0lkIjoiOWU4MDg4YjEtNGNiNC00Y2RmLTg0MzUtMmVhMDAzOTEzZWZhIiwiVV9FbWFpbCI6ImFiLnRoaW9uZ2FuZUBxdWFsaXNvZnQuc24iLCJ0ZW5hbnRJZCI6IlFTLTIwMjYtSkFOViIsIlVfUm9sZSI6IlNVUEVSX0FETUlOIiwiaWF0IjoxNzY5NTcwOTY5LCJleHAiOjE3NzIxNjI5Njl9.KbKavzB503eGuYIR_FvFrTbSlVDHAbR_C1uJ8f1nDyo';
const TRIAL_SECRET = process.env.TRIAL_JWT_SECRET || 'trial-secret-key-min-32-characters-for-qualisoft';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  // 1. Gestion CORS pour les API
  if (pathname.startsWith('/api/')) {
    response.headers.set('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-tenant-id, x-trial-token');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, { status: 204, headers: response.headers });
    }

    // Protection API avec Bearer token depuis les headers
    if (!API_PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
      const authHeader = request.headers.get('authorization');
      if (!authHeader?.startsWith('Bearer ')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    return response;
  }

  // 2. Routes publiques statiques (fichiers, next static)
  if (PUBLIC_ROUTES.includes(pathname) || 
      pathname.startsWith('/_next/') || 
      pathname.startsWith('/static/') ||
      pathname.includes('.')) {
    return response;
  }

  // 3. Protection routes TRIAL (/trial/*) - via cookie car c'est une session temporaire
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

      response.headers.set('x-user-type', 'trial');
      response.headers.set('x-tenant-id', payload.tenantId as string);
      return response;
      
    } catch (error) {
      return NextResponse.redirect(new URL('/essai', request.url));
    }
  }

  // 4. Protection routes DASHBOARD (/dashboard/* et /admin/*) 
  // NOTE : On ne redirige PAS ici car le token est en Bearer (localStorage)
  // La protection est gérée côté client via le Layout et Zustand
  if (pathname.startsWith('/dashboard/') || pathname.startsWith('/admin/')) {
    // On laisse passer, le Layout fera la vérification avec le store
    // Optionnel : On pourrait vérifier un cookie "session_hint" ici si vous voulez une double sécurité
    return response;
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
};