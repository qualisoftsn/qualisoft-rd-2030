import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

/**
 * 🛰️ DOMAINES AUTORISÉS À AFFICHER LA LANDING PAGE
 */
const PUBLIC_MASTER_DOMAINS = new Set(['elite', 'www', 'localhost']);

export default withAuth(
  function middleware(req) {
    const { pathname, hostname } = req.nextUrl;
    const subdomain = hostname.split('.')[0].toLowerCase();

    // 🚩 RÈGLE D'OR : La racine d'Elite est PUBLIQUE
    // Si on est sur elite.qualisoft.sn/ -> ON PASSE (Landing Page)
    if (pathname === "/" && PUBLIC_MASTER_DOMAINS.has(subdomain)) {
      return NextResponse.next();
    }

    // 🚩 RÈGLE 2 : Les sous-domaines (pad, sagam) n'ont pas de landing page.
    // Si on est sur pad.qualisoft.sn/ -> ON FORCE le login
    if (pathname === "/" && !PUBLIC_MASTER_DOMAINS.has(subdomain)) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname, hostname } = req.nextUrl;
        const subdomain = hostname.split('.')[0].toLowerCase();

        // 🔓 ON AUTORISE SANS CONNEXION :
        // 1. La racine des domaines maîtres (Landing Page)
        // 2. Toutes les pages d'authentification (/auth/login, etc.)
        // 3. Les fichiers système de Next.js et les images
        if (
          (pathname === "/" && PUBLIC_MASTER_DOMAINS.has(subdomain)) || 
          pathname.startsWith("/auth")
        ) {
          return true;
        }

        // 🔒 POUR TOUT LE RESTE (Dashboard, Admin) : Il faut être connecté
        return !!token;
      },
    },
    // On aligne le nom du cookie sur celui de route.ts
    cookies: {
      sessionToken: {
        name: process.env.NODE_ENV === "production" 
          ? "__Secure-next-auth.session-token" 
          : "next-auth.session-token",
      },
    },
    pages: {
      signIn: "/auth/login",
    },
  }
);

/**
 * 🛠️ CONFIGURATION DU MATCHER
 * On intercepte tout sauf les fichiers statiques et les APIs d'auth.
 */
export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|uploads|images|.*\\..*).*)",
  ],
};