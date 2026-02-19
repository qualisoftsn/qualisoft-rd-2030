/* eslint-disable @typescript-eslint/no-unused-vars */
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { JWT } from "next-auth/jwt";

/**
 * 🛰️ TYPE MATRIX : Synchronisé avec le JWT de NextAuth
 */
type MatrixToken = JWT & {
  U_Role?: string;
  U_TenantDomain?: string; // Le slug (ex: "pad", "sagam")
};

const isProduction = process.env.NODE_ENV === "production";

/**
 * 🏛️ DOMAINES DE GESTION (Périmètre Master)
 */
const MASTER_DOMAINS = new Set(['app', 'elite', 'www', 'localhost', 'matrix', 'qualisoft']);

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token as MatrixToken;
    const { pathname, hostname } = req.nextUrl;
    
    // 1. Extraction propre du sous-domaine (ex: "pad" de "pad.qualisoft.sn")
    const hostParts = hostname.split('.');
    const currentSubdomain = hostParts[0].toLowerCase();
    
    const userRole = token?.U_Role;
    const assignedTenant = token?.U_TenantDomain?.toLowerCase();

    // --- 🚨 ZONE 1 : PROTECTION DU NOYAU ADMIN ---
    if (pathname.startsWith("/admin")) {
      if (userRole !== "SUPER_ADMIN") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
      return NextResponse.next();
    }

    // --- 🧭 ZONE 2 : ISOLATION TERRITORIALE (Dashboard) ---
    if (pathname.startsWith("/dashboard") || pathname === "/") {
      
      // A. Passe-droit pour le SUPER_ADMIN
      if (userRole === "SUPER_ADMIN") return NextResponse.next();

      // B. Vérification de la cohérence du domaine
      const isOnMasterDomain = MASTER_DOMAINS.has(currentSubdomain);
      const isCorrectTerritory = currentSubdomain === assignedTenant;

      // C. LOGIQUE DE REDIRECTION FORCÉE (Si l'utilisateur n'est pas chez lui)
      if (assignedTenant && !isCorrectTerritory) {
        
        // Sécurité : Si on est déjà sur le bon domaine mais que le middleware boucle, on stop.
        if (currentSubdomain === assignedTenant) return NextResponse.next();

        const targetUrl = req.nextUrl.clone();
        
        // On reconstruit l'hôte pour pointer vers le domaine souverain de l'utilisateur
        // Cas particulier : si on est sur le domaine racine qualisoft.sn
        if (hostParts.length <= 2) {
          targetUrl.host = `${assignedTenant}.${hostname}`;
        } else {
          hostParts[0] = assignedTenant;
          targetUrl.host = hostParts.join('.');
        }
        
        targetUrl.pathname = "/dashboard";
        
        console.log(`🛰️ Redirection territoriale : ${hostname} -> ${targetUrl.host}`);
        return NextResponse.redirect(targetUrl);
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // Le middleware ne s'exécute que si authorized renvoie true
      authorized: ({ token }) => !!token,
    },
    // 🚩 CRITIQUE : Configuration des cookies pour correspondre à route.ts
    cookies: {
      sessionToken: {
        name: isProduction ? "__Secure-next-auth.session-token" : "next-auth.session-token",
      },
    },
    pages: {
      signIn: "/auth/login",
    },
  }
);

/**
 * 🛠️ CONFIGURATION DU MATCHER
 * On exclut tout ce qui est public ou fichiers statiques pour éviter les boucles sur les images/css
 */
export const config = {
  matcher: [
    /*
     * Intercepte tout sauf :
     * - api/auth, auth/login, auth/error (Handshake & Public Pages)
     * - _next (Fichiers de build Next.js)
     * - static, favicon, images (Fichiers statiques)
     */
    "/((?!api/auth|auth|_next/static|_next/image|favicon.ico|uploads|.*\\..*).*)",
  ],
};