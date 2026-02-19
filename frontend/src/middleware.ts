/* eslint-disable @typescript-eslint/no-explicit-any */
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

const MASTER_DOMAINS = new Set(['elite', 'www', 'app', 'matrix']);

export default withAuth(
  function middleware(req) {
    const { pathname, hostname } = req.nextUrl;
    const subdomain = hostname.split('.')[0].toLowerCase();
    const token = req.nextauth.token as any;

    // 🚩 CAS 1 : LANDING PAGE (/)
    if (pathname === "/") {
      // Si on est sur pad.qualisoft.sn, on INTERDIT la landing page elite, on force le login
      if (!MASTER_DOMAINS.has(subdomain)) {
        return NextResponse.redirect(new URL("/auth/login", req.url));
      }
      // Si on est sur elite.qualisoft.sn, on laisse voir la Landing Page
      return NextResponse.next();
    }

    // 🚩 CAS 2 : PROTECTION DASHBOARD
    if (pathname.startsWith("/dashboard")) {
        const assignedTenant = token?.U_TenantDomain?.toLowerCase();
        // Si je suis sur pad.qualisoft.sn mais mon token dit sagam -> Redirection
        if (assignedTenant && subdomain !== assignedTenant && token?.U_Role !== "SUPER_ADMIN") {
            const targetUrl = req.nextUrl.clone();
            targetUrl.host = `${assignedTenant}.qualisoft.sn`;
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
        
        // La racine des domaines maîtres et les pages d'auth sont toujours autorisées
        if ((pathname === "/" && MASTER_DOMAINS.has(subdomain)) || pathname.startsWith("/auth")) {
            return true;
        }
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