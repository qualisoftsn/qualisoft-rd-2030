/* eslint-disable @typescript-eslint/no-unused-vars */
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { JWT } from "next-auth/jwt";

type MatrixToken = JWT & {
  U_Role?: string;
  U_TenantDomain?: string;
};

const isProduction = process.env.NODE_ENV === "production";
const MASTER_DOMAINS = new Set(['app', 'elite', 'www', 'localhost', 'matrix', 'qualisoft']);

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token as MatrixToken;
    const { pathname, hostname } = req.nextUrl;
    
    const hostParts = hostname.split('.');
    const currentSubdomain = hostParts[0].toLowerCase();
    
    const userRole = token?.U_Role;
    const assignedTenant = token?.U_TenantDomain?.toLowerCase();

    // 1. PROTECTION ADMIN
    if (pathname.startsWith("/admin") && userRole !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // 2. ISOLATION TERRITORIALE (Dashboard & Racine)
    if (pathname.startsWith("/dashboard") || pathname === "/") {
      if (userRole === "SUPER_ADMIN") return NextResponse.next();

      const isCorrectTerritory = currentSubdomain === assignedTenant;

      if (assignedTenant && !isCorrectTerritory) {
        // Éviter la boucle : si on est déjà en train de rediriger, on stoppe
        if (req.nextUrl.searchParams.get('redirected') === 'true') return NextResponse.next();

        const targetUrl = req.nextUrl.clone();
        if (hostParts.length <= 2) {
          targetUrl.host = `${assignedTenant}.${hostname}`;
        } else {
          hostParts[0] = assignedTenant;
          targetUrl.host = hostParts.join('.');
        }
        
        targetUrl.pathname = "/dashboard";
        targetUrl.searchParams.set('redirected', 'true'); // Flag anti-boucle
        
        return NextResponse.redirect(targetUrl);
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // 🚩 CRITIQUE : Ne laisse passer QUE si le token existe vraiment
      authorized: ({ token }) => !!token?.accessToken || !!token?.sub,
    },
    cookies: {
      // 🚩 DOIT ÊTRE UN MIROIR EXACT de route.ts
      sessionToken: {
        name: isProduction ? "__Secure-next-auth.session-token" : "next-auth.session-token",
      },
    },
    pages: {
      signIn: "/auth/login", // Si non autorisé, retour automatique ici
    },
  }
);

export const config = {
  matcher: [
    // On protège tout sauf les routes publiques explicitement
    "/((?!api/auth|auth|_next/static|_next/image|favicon.ico|uploads|images|.*\\..*).*)",
  ],
};