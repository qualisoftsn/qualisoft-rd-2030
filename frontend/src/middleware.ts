/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 🛰️ MIDDLEWARE SOUVERAIN V4 - QUALISOFT ELITE
 * CONCEPTION : Architecture Multi-Tenant Multi-Niveaux.
 * RÔLE : 
 * 1. Verrouillage de l'accès hors authentification.
 * 2. Isolation territoriale (Un utilisateur ne peut accéder qu'à son sous-domaine).
 * 3. Protection du Noyau Master (Accès /admin réservé au Super Admin).
 */

import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { JWT } from "next-auth/jwt";

// 1. DÉFINITION DU TYPE POUR LE JETON MATRIX (Sync avec NextAuth Callbacks)
type MatrixToken = JWT & {
  U_Role?: string;
  U_TenantDomain?: string; // Doit être le slug (ex: "pad") pour correspondre au hostname
};

// 2. DOMAINES MAÎTRES (Points d'entrée de la Matrix Management)
const MASTER_DOMAINS = new Set(['app', 'elite', 'www', 'localhost', 'matrix']);

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token as MatrixToken;
    const { pathname, hostname } = req.nextUrl;
    
    // Extraction du sous-domaine (ex: "pad" de "pad.qualisoft.sn")
    const hostParts = hostname.split('.');
    const currentSubdomain = hostParts[0].toLowerCase();
    
    const userRole = token?.U_Role;
    // On s'assure que le tenant dans le token est traité uniformément en minuscule
    const assignedTenant = token?.U_TenantDomain?.toLowerCase();

    // --- 🚨 ZONE 1 : PROTECTION DU NOYAU MASTER (/admin) ---
    // Seul le SUPER_ADMIN peut franchir ce périmètre, quel que soit le sous-domaine.
    if (pathname.startsWith("/admin")) {
      if (userRole !== "SUPER_ADMIN") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
      return NextResponse.next();
    }

    // --- 🧭 ZONE 2 : ROUTAGE TERRITORIAL (Dashboard & Business Logic) ---
    if (pathname.startsWith("/dashboard") || pathname === "/") {
      
      // A. Le Super Admin a un passe-droit universel (Visibilité totale sur la Fédération)
      if (userRole === "SUPER_ADMIN") return NextResponse.next();

      // B. Vérification de l'ancrage territorial
      const isOnMasterDomain = MASTER_DOMAINS.has(currentSubdomain);
      const isCorrectTerritory = currentSubdomain === assignedTenant;

      // Si l'utilisateur tente de naviguer sur un domaine qui n'est pas le sien
      // ou s'il tente d'accéder au dashboard depuis le domaine "app" ou "www"
      if (assignedTenant && !isCorrectTerritory) {
        const targetUrl = req.nextUrl.clone();
        
        // Reconstruction chirurgicale de l'URL vers son domaine souverain
        hostParts[0] = assignedTenant;
        targetUrl.host = hostParts.join('.');
        
        // On force la redirection vers la racine de son propre sous-domaine
        targetUrl.pathname = "/dashboard";
        
        return NextResponse.redirect(targetUrl);
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // Si authorized renvoie false, Next-Auth redirige automatiquement vers signIn (pages.signIn)
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/auth/login", // Le point de ralliement unique
    },
  }
);

// 3. CONFIGURATION DU MATCHER (VIGILANCE MAXIMALE)
export const config = {
  matcher: [
    /*
     * On intercepte TOUT sauf :
     * - api/auth (Nécessaire pour le handshake NextAuth)
     * - auth/* (Pages de login/register publiques)
     * - static, _next, favicon (Fichiers système)
     * - Les fichiers avec extensions (.png, .svg, etc.)
     */
    "/((?!api/auth|auth|static|.*\\..*|_next).*)",
  ],
};