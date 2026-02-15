/* eslint-disable @typescript-eslint/no-explicit-any */
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

/**
 * 🛡️ MIDDLEWARE SOUVERAIN - QUALISOFT ELITE
 * Rôle : Gardien des routes et gestionnaire de trafic multi-tenant.
 */
export default withAuth(
  function middleware(req) {
    // 1. Récupération de l'identité numérique (Token)
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;
    
    // On sécurise les accès aux propriétés via un cast (pour éviter les erreurs TypeScript)
    const userRole = token?.U_Role as string | undefined;
    const userTenantDomain = (token as any)?.U_TenantDomain?.toLowerCase(); // ex: 'sde'

    // -----------------------------------------------------------
    // 🔒 ZONE 1 : SÉCURITÉ ABSOLUE (/admin)
    // Seul le SUPER_ADMIN peut franchir cette ligne.
    // -----------------------------------------------------------
    if (pathname.startsWith("/admin")) {
      if (userRole !== "SUPER_ADMIN") {
        console.warn(`[MIDDLEWARE] Intrusion bloquée sur /admin pour : ${token?.email}`);
        // L'intrus est renvoyé vers son espace légitime
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
      // Le SUPER_ADMIN passe.
      return NextResponse.next();
    }

    // -----------------------------------------------------------
    // 🧭 ZONE 2 : ROUTAGE TERRITORIAL (/dashboard)
    // Redirection automatique vers le sous-domaine du client.
    // -----------------------------------------------------------
    if (pathname.startsWith("/dashboard")) {
      const hostname = req.headers.get('host') || '';
      const subdomain = hostname.split('.')[0].toLowerCase();
      
      // Liste des domaines "Siège" (Master)
      const masterDomains = ['app', 'elite', 'www', 'localhost'];
      const isOnMasterDomain = masterDomains.includes(subdomain);

      // LOGIQUE :
      // SI je suis un utilisateur Client (ex: SDE)
      // ET que je suis perdu sur le domaine Master (app.qualisoft.sn)
      // ALORS je suis redirigé chez moi (sde.qualisoft.sn)
      // (Exception : Le Super Admin peut naviguer partout)
      if (
        userRole !== "SUPER_ADMIN" &&    // Pas un Super Admin
        userTenantDomain &&              // J'ai un domaine assigné
        userTenantDomain !== 'matrix' && // Ce n'est pas Matrix
        isOnMasterDomain                 // Je suis sur le Master
      ) {
        const url = req.nextUrl.clone();
        const hostParts = hostname.split('.');
        
        // On remplace 'app' par 'sde'
        hostParts[0] = userTenantDomain;
        url.host = hostParts.join('.');
        
        // En production, on force le HTTPS via le protocole si nécessaire, 
        // mais NextUrl garde généralement le protocole de la requête entrante.
        
        console.log(`[MIDDLEWARE] Redirection territoriale : ${token?.email} -> ${url.host}`);
        return NextResponse.redirect(url);
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // Le middleware ne s'active que si l'utilisateur possède un Token valide
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/auth/login", // Si pas de token, direction Login
    },
  }
);

export const config = {
  matcher: [
    // On protège toute la section Admin et Dashboard
    "/admin/:path*",
    "/dashboard/:path*",
    // On exclut les fichiers statiques, l'API publique et les images
    "/((?!api/auth|auth|static|.*\\..*|_next).*)",
  ],
};