/* eslint-disable @typescript-eslint/no-explicit-any */
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // Récupération du token enrichi (grâce aux types NextAuth augmentés)
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;
    
    // 1. DÉTECTION DU SOUS-DOMAINE ACTUEL
    // On gère le cas localhost pour le dev, et les domaines réels pour la prod
    const hostname = req.headers.get('host') || '';
    let subdomain = 'app'; // Valeur par défaut
    
    if (hostname.includes('localhost')) {
       // En local, on ne peut pas vraiment tester les sous-domaines facilement sans config hosts
       // On simule 'app' ou on prend ce qui vient
       subdomain = 'app';
    } else {
       const parts = hostname.split('.');
       if (parts.length > 2) {
         subdomain = parts[0].toLowerCase();
       }
    }
    
    // 2. LOGIQUE DE REDIRECTION (Ta logique "Fidélisation")
    // Si l'utilisateur est connecté et essaie d'accéder au dashboard
    if (token && pathname.startsWith("/dashboard")) {
        // On récupère le domaine assigné à l'utilisateur dans son token
        // (Assure-toi que le callback JWT dans [...nextauth].ts peuple bien ce champ)
        const userTenantDomain = (token as any).tenantDomain?.toLowerCase();
        
        // Si je suis sur 'app' ou 'elite' (Master) mais que je suis un user 'sde'
        // ALORS je dois être redirigé vers sde.qualisoft.sn
        const isMasterDomain = ['app', 'elite', 'www'].includes(subdomain);
        
        if (isMasterDomain && userTenantDomain && userTenantDomain !== 'matrix') {
            const url = req.nextUrl.clone();
            const hostParts = hostname.split('.');
            // On remplace le sous-domaine
            hostParts[0] = userTenantDomain;
            url.host = hostParts.join('.');
            // url.protocol est déjà https en prod
            
            console.log(`🛰️ [MIDDLEWARE] Redirection de ${token.email} vers ${url.host}`);
            return NextResponse.redirect(url);
        }
    }

    // 3. PROTECTION ADMINISTRATIVE (/admin)
    // Seul le SUPER_ADMIN ou ADMIN du Master peut aller sur /admin
    if (pathname.startsWith("/admin")) {
      const userRole = (token as any).role;
      // Si on n'est pas Super Admin, on dégage vers le dashboard standard
      if (userRole !== "SUPER_ADMIN") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // Le middleware ne s'active que si l'utilisateur est authentifié (a un token)
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/auth/login",
      error: "/auth/error",
    },
  }
);

export const config = {
  matcher: [
    // On protège le dashboard et l'admin
    "/dashboard/:path*",
    "/admin/:path*",
    // On exclut les routes d'API, les fichiers statiques, et l'auth
    "/((?!api/auth|auth|static|.*\\..*|_next).*)",
  ],
};