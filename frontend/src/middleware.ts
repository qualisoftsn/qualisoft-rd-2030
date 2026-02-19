/* eslint-disable @typescript-eslint/no-explicit-any */
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname, hostname } = req.nextUrl;
    const subdomain = hostname.split('.')[0].toLowerCase();
    const token = req.nextauth.token as any;

    // 1. GESTION DE LA RACINE (/)
    if (pathname === "/") {
      // Si on est sur elite.qualisoft.sn -> ON LAISSE PASSER (Landing Page)
      if (subdomain === "elite") return NextResponse.next();
      
      // Si on est sur un sous-domaine (ex: pad) -> DIRECTION LOGIN
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }

    // 2. GESTION DU DASHBOARD (Protection Territoriale)
    if (pathname.startsWith("/dashboard")) {
      const assignedTenant = token?.U_TenantDomain?.toLowerCase();
      
      // Si le domaine actuel ne correspond pas au domaine assigné (et pas Super Admin)
      if (assignedTenant && subdomain !== assignedTenant && token?.U_Role !== "SUPER_ADMIN") {
        const targetUrl = req.nextUrl.clone();
        // 🚩 CORRECTION : On reconstruit proprement sans concaténation sauvage
        targetUrl.host = `${assignedTenant}.qualisoft.sn`;
        targetUrl.pathname = "/dashboard";
        return NextResponse.redirect(targetUrl);
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname, hostname } = req.nextUrl;
        const subdomain = hostname.split('.')[0].toLowerCase();

        // 🔓 ACCÈS PUBLICS :
        // - Racine d'Elite
        // - Toutes les pages d'authentification
        // - Fichiers statiques (images, etc)
        if (
          (pathname === "/" && subdomain === "elite") || 
          pathname.startsWith("/auth")
        ) return true;

        return !!token;
      },
    },
    cookies: {
      sessionToken: {
        name: process.env.NODE_ENV === "production" ? "__Secure-next-auth.session-token" : "next-auth.session-token",
      }
    },
    pages: { signIn: "/auth/login" }
  }
);

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico|uploads|images|.*\\..*).*)"],
};