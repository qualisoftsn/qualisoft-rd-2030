/**
 * CHEMIN ABSOLU : /src/proxy.ts
 * PROJET : Qualisoft Elite RD 2030
 * RÔLE : Unique Gardien (Auth Next-Auth + Routage Multi-Tenant Dynamique)
 */

import { withAuth, NextAuthMiddlewareOptions } from "next-auth/middleware";
import { NextResponse, NextRequest } from "next/server";
import { JWT } from "next-auth/jwt";

// ✅ Extension du Token pour inclure le domaine souverain
type QualisoftToken = JWT & {
  U_Id?: string;
  U_Role?: string;
  U_Email?: string;
  tenantId?: string;
  U_TenantDomain?: string; // Ajout crucial pour la redirection
};

export default withAuth(
  function middleware(req: NextRequest & { nextauth: { token: JWT | null } }) {
    const token = req.nextauth.token as QualisoftToken;
    const { pathname } = req.nextUrl;
    const hostname = req.headers.get('host') || '';

    // 🛰️ 1. DÉTECTION DU SOUS-DOMAINE ACTUEL
    const subdomain = hostname.split('.')[0].toLowerCase();

    // 🚀 2. ALGORITHME DE REDIRECTION SOUVERAINE (Fidélisation)
    // Si l'utilisateur est connecté et essaie d'accéder au dashboard
    if (token && pathname.startsWith("/dashboard")) {
      const userDomain = token.U_TenantDomain?.toLowerCase();

      /**
       * SI l'utilisateur est sur 'elite' mais appartient à un autre nœud (ex: 'sde')
       * ALORS on le propulse vers son domaine indicatif.
       */
      if (subdomain === 'elite' && userDomain && userDomain !== 'matrix') {
        const targetUrl = new URL(pathname, req.url);
        targetUrl.hostname = `${userDomain}.qualisoft.sn`;
        
        console.log(`🛰️ [MATRIX] Redirection de ${token.U_Email} vers son nœud : ${targetUrl.hostname}`);
        return NextResponse.redirect(targetUrl);
      }
    }

    // 🛡️ 3. PROTECTION RÉGALIENNE (/admin)
    // Seul le SUPER_ADMIN peut rester sur le nœud Master 'elite'
    if (pathname.startsWith("/admin")) {
      if (token?.U_Role !== "SUPER_ADMIN") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    // 🔑 4. PROTECTION DASHBOARD GÉNÉRIQUE
    if (pathname.startsWith("/dashboard") && !token?.U_Role) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }

    const response = NextResponse.next();

    // 🔗 5. INJECTION DU TENANT POUR LE CONTEXTE API
    response.headers.set('x-qualisoft-tenant', subdomain);

    return response;
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token?.sub,
    },
    pages: {
      signIn: "/auth/login",
      error: "/auth/error",
    },
  } as NextAuthMiddlewareOptions
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/profile/:path*",
    "/settings/:path*",
    /* On intercepte tout sauf les assets et l'API */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};