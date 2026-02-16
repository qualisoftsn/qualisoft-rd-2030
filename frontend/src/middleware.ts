import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { JWT } from "next-auth/jwt";

/**
 * 🛡️ MIDDLEWARE SOUVERAIN V3 - QUALISOFT ELITE
 * Isolation multi-tenant et protection du noyau Matrix.
 */

// 1. DÉFINITION DU TYPE POUR LE JETON MATRIX
type MatrixToken = JWT & {
  U_Role?: string;
  U_TenantDomain?: string;
};

// 2. DOMAINES RACINES (SANS REDIRECTION)
const MASTER_DOMAINS = new Set(['app', 'elite', 'www', 'localhost']);

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token as MatrixToken;
    const { pathname, hostname } = req.nextUrl;
    
    const hostParts = hostname.split('.');
    const currentSubdomain = hostParts[0].toLowerCase();
    
    const userRole = token?.U_Role;
    const targetTenant = token?.U_TenantDomain?.toLowerCase();

    // --- 🚨 ZONE 1 : PROTECTION DU NOYAU (/admin) ---
    if (pathname.startsWith("/admin")) {
      if (userRole !== "SUPER_ADMIN") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
      return NextResponse.next();
    }

    // --- 🧭 ZONE 2 : ROUTAGE TERRITORIAL (/dashboard) ---
    if (pathname.startsWith("/dashboard")) {
      
      // Le Super Admin a un passe-droit universel
      if (userRole === "SUPER_ADMIN") return NextResponse.next();

      const isOnMaster = MASTER_DOMAINS.has(currentSubdomain);
      const isCorrectDomain = currentSubdomain === targetTenant;

      // Si l'utilisateur n'est pas sur son territoire assigné
      if (targetTenant && targetTenant !== 'matrix' && (!isCorrectDomain || isOnMaster)) {
        const targetUrl = req.nextUrl.clone();
        
        // Reconstruction forcée vers le sous-domaine client (ex: sde.qualisoft.sn)
        hostParts[0] = targetTenant;
        targetUrl.host = hostParts.join('.');
        
        return NextResponse.redirect(targetUrl);
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/auth/login",
    },
  }
);

export const config = {
  matcher: [
    /*
     * Protection globale excluant les fichiers statiques et l'auth publique
     */
    "/((?!api/auth|auth|static|.*\\..*|_next).*)",
  ],
};