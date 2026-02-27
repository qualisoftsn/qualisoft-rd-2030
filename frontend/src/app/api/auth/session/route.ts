/* eslint-disable @typescript-eslint/no-unused-vars */
// app/api/auth/route.ts
import { NextResponse } from 'next/server';

/**
 * 🔐 POINT D'ENTRÉE UNIQUE D'AUTHENTIFICATION
 * Toutes les requêtes d'authentification sont redirigées vers les endpoints dédiés
 */
export async function POST(request: Request) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  // Redirection intelligente vers les endpoints existants
  if (pathname.includes('/login-master')) {
    return NextResponse.redirect(new URL('/api/auth/login-master', request.url));
  }
  
  return NextResponse.redirect(new URL('/api/auth/login', request.url));
}

export async function GET(request: Request) {
  return NextResponse.json({
    status: 'active',
    auth_system: 'QUALISOFT_ELITE_HTTPONLY',
    endpoints: {
      login: '/api/auth/login',
      login_master: '/api/auth/login-master',
      refresh: '/api/auth/refresh',
      logout: '/api/auth/logout',
      session: '/api/auth/session'
    },
    security: {
      token_storage: 'HttpOnly Cookies',
      cross_subdomain: true,
      tenant_isolation: true
    }
  });
}