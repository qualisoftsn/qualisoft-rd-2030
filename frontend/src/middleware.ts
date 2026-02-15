import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. On laisse passer les fichiers statiques et l'API publique
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/static') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // 2. On vérifie si l'utilisateur est connecté (Token Session)
  // Le secret DOIT correspondre à celui dans .env (NEXTAUTH_SECRET)
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  
  // 3. PROTECTION : Si on essaie d'aller sur /admin ou /dashboard SANS token
  const isProtectedRoute = pathname.startsWith('/admin') || pathname.startsWith('/dashboard');
  
  if (isProtectedRoute && !token) {
    // ⛔ PAS DE TICKET ? -> DIRECTION LOGIN
    const loginUrl = new URL('/auth/login', req.url);
    // On garde en mémoire où il voulait aller pour le rediriger après
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 4. PROTECTION INVERSE : Si on est déjà connecté et qu'on va sur /auth/login
  if (pathname.startsWith('/auth/login') && token) {
    // ✅ DÉJÀ CONNECTÉ ? -> DIRECTION DASHBOARD
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
}

// Configuration des routes à surveiller
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/auth/:path*'
  ],
};