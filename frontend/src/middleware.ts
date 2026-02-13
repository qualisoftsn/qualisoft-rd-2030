/**
 * CHEMIN ABSOLU : /src/middleware.ts
 * PROJET : Qualisoft Elite RD 2030
 * RÔLE : Douane Unique (Auth + Routage Multi-Tenant)
 */

import { withAuth, NextAuthMiddlewareOptions } from "next-auth/middleware";
import { NextResponse, NextRequest } from "next/server";
import { JWT } from "next-auth/jwt";

type QualisoftToken = JWT & {
  U_Id?: string;
  U_Role?: string;
  U_Email?: string;
  tenantId?: string;
};

/**
 * 🏛️ MIDDLEWARE DE HAUTE SÉCURITÉ FUSIONNÉ
 */
export default withAuth(
  function middleware(req: NextRequest & { nextauth: { token: JWT | null } }) {
    const token = req.nextauth.token as QualisoftToken;
    const { pathname } = req.nextUrl;
    const hostname = req.headers.get('host') || '';

    // --- 🛰️ BLOC A : FIDÉLISATION (SOU-DOMAINE) ---
    const subdomain = hostname.split('.')[0];
    
    // --- 🛡️ BLOC B : SÉCURITÉ RÉGALIENNE ---
    
    // 1. Protection Master Node (/admin)
    if (pathname.startsWith("/admin")) {
      if (token?.U_Role !== "SUPER_ADMIN") {
        console.warn(`[SECURITY] Accès bloqué sur /admin - Utilisateur: ${token?.U_Email || 'Inconnu'}`);
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    // 2. Protection Instance Client (/dashboard)
    if (pathname.startsWith("/dashboard")) {
      if (!token?.U_Role) {
        return NextResponse.redirect(new URL("/auth/login", req.url));
      }
    }

    // On prépare la réponse
    const response = NextResponse.next();

    // 🔗 On injecte le sous-domaine dans les headers pour que le reste de l'app sache où elle est
    response.headers.set('x-qualisoft-tenant', subdomain);

    return response;
  },
  {
    callbacks: {
      authorized: ({ token }: { token: JWT | null }): boolean => {
        const qToken = token as QualisoftToken;
        return !!qToken?.sub;
      },
    },
    pages: {
      signIn: "/auth/login",
      error: "/auth/error",
    },
  } as NextAuthMiddlewareOptions
);

/**
 * 🎯 MATCHER GLOBAL
 */
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/profile/:path*",
    "/settings/:path*",
    /* On ajoute ici la détection sur toutes les pages sauf ressources statiques */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};