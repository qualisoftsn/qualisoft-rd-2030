/* eslint-disable @typescript-eslint/no-explicit-any */
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // On récupère le token décodé
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;
    const userRole = token?.U_Role as string | undefined;

    // -----------------------------------------------------------
    // 1. RÈGLE SUPRÊME : ACCÈS MASTER (/admin)
    // -----------------------------------------------------------
    if (pathname.startsWith("/admin")) {
      // Seul le SUPER_ADMIN passe. Les autres sont éjectés vers le dashboard.
      if (userRole === "SUPER_ADMIN") {
        return NextResponse.next(); // ✅ ON LAISSE PASSER VERS /admin/matrix
      } else {
        // Tentative d'intrusion -> retour à la case départ
        return NextResponse.redirect(new URL("/auth/login", req.url));
      }
    }

    // -----------------------------------------------------------
    // 2. LOGIQUE DE REDIRECTION INTELLIGENTE (Multi-Tenant)
    // -----------------------------------------------------------
    // Si on est sur le dashboard, on vérifie si l'utilisateur est sur le bon domaine
    if (pathname.startsWith("/dashboard")) {
        const hostname = req.headers.get('host') || '';
        const subdomain = hostname.split('.')[0].toLowerCase();
        
        // Domaine assigné à l'utilisateur (ex: 'sde')
        const userDomain = (token as any).U_TenantDomain?.toLowerCase(); // Assure-toi que ce champ existe dans ton JWT callback

        // Si l'utilisateur est 'sde' mais qu'il est connecté sur 'app' (Master)
        // On le redirige vers sde.qualisoft.sn
        // SAUF si c'est le Super Admin (qui a le droit d'être partout)
        if (userRole !== "SUPER_ADMIN" && userDomain && subdomain !== userDomain && userDomain !== 'matrix') {
            const url = req.nextUrl.clone();
            const hostParts = hostname.split('.');
            hostParts[0] = userDomain; // On remplace le sous-domaine
            url.host = hostParts.join('.');
            // En prod, url.protocol est déjà https
            return NextResponse.redirect(url);
        }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // Le middleware ne se déclenche que si l'utilisateur est connecté
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/auth/login",
    },
  }
);

export const config = {
  matcher: [
    // On surveille l'admin et le dashboard
    "/admin/:path*",
    "/dashboard/:path*",
    // On ignore les assets et l'API
    "/((?!api/auth|auth|static|.*\\..*|_next).*)",
  ],
};