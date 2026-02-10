/**
 * CHEMIN ABSOLU : /src/proxy.ts
 * PROJET : Qualisoft Elite RD 2030
 * RÔLE : Proxy de sécurité et Aiguillage (Next-Auth)
 */

import { withAuth, NextAuthMiddlewareOptions } from "next-auth/middleware";
import { NextResponse, NextRequest } from "next/server";
import { JWT } from "next-auth/jwt";

/**
 * 🛡️ TYPE QUALISOFT TOKEN
 * Intersection pour éviter les erreurs d'extension d'interface JWT conventionnelles.
 * Scelle les propriétés U_ et le contexte Multi-Tenant.
 */
type QualisoftToken = JWT & {
  U_Id?: string;
  U_Role?: string;
  U_Email?: string;
  tenantId?: string;
};

/**
 * 🏛️ PROXY D'AIGUILLAGE SÉCURISÉ
 */
export default withAuth(
  function middleware(req: NextRequest & { nextauth: { token: JWT | null } }) {
    const token = req.nextauth.token as QualisoftToken;
    const { pathname } = req.nextUrl;

    // 1. PROTECTION DU SEGMENT RÉGALIEN (/admin)
    // Réservé exclusivement au Master Node (SUPER_ADMIN)
    if (pathname.startsWith("/admin")) {
      if (token?.U_Role !== "SUPER_ADMIN") {
        console.warn(`[SECURITY] Accès bloqué sur /admin - Utilisateur: ${token?.U_Email || 'Identité inconnue'}`);
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    // 2. PROTECTION DU SEGMENT INSTANCE (/dashboard)
    // Vérification de l'intégrité du rôle pour l'accès aux données Tenantisées
    if (pathname.startsWith("/dashboard")) {
      if (!token?.U_Role) {
        return NextResponse.redirect(new URL("/auth/login", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      /**
       * ✅ VALIDATION SOUVERAINE
       * Le tunnel n'est franchissable que si le jeton possède un identifiant sujet (sub).
       */
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
 * 🎯 MATCHER ELITE
 */
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/profile/:path*",
    "/settings/:path*"
  ],
};