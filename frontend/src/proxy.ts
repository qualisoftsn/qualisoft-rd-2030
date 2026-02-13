/**
 * CHEMIN ABSOLU : /src/proxy.ts
 * PROJET : Qualisoft Elite RD 2030
 * RÔLE : Unique Gardien (Auth Next-Auth + Routage Multi-Tenant)
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

export default withAuth(
  function middleware(req: NextRequest & { nextauth: { token: JWT | null } }) {
    const token = req.nextauth.token as QualisoftToken;
    const { pathname } = req.nextUrl;
    const hostname = req.headers.get('host') || '';

    // 🛰️ 1. DÉTECTION DU SOUS-DOMAINE (sde.qualisoft.sn -> sde)
    const subdomain = hostname.split('.')[0];

    // 🛡️ 2. PROTECTION RÉGALIENNE (/admin)
    if (pathname.startsWith("/admin")) {
      if (token?.U_Role !== "SUPER_ADMIN") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    // 🔑 3. PROTECTION DASHBOARD
    if (pathname.startsWith("/dashboard") && !token?.U_Role) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }

    const response = NextResponse.next();

    // 🔗 4. INJECTION DU TENANT (Pour que l'app sache sur quel nœud elle est)
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
    /* On applique le middleware à tout sauf le dossier public et l'api */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};