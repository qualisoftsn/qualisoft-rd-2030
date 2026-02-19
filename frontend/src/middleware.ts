/* eslint-disable @typescript-eslint/no-explicit-any */
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname, hostname } = req.nextUrl;
    const subdomain = hostname.split('.')[0].toLowerCase();
    const token = req.nextauth.token as any;

    // 🚩 RÈGLE 1 : Si on est sur elite.qualisoft.sn et sur la racine -> C'est la Landing Page (Autorisée)
    if (subdomain === "elite" && pathname === "/") {
      return NextResponse.next();
    }

    // 🚩 RÈGLE 2 : Sécurité du Dashboard (Pas de redirection auto vers d'autres domaines ici pour l'instant)
    if (pathname.startsWith("/dashboard")) {
        // On vérifie juste si la session est valide
        if (!token) return NextResponse.redirect(new URL("/auth/login", req.url));
        return NextResponse.next();
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname, hostname } = req.nextUrl;
        const subdomain = hostname.split('.')[0].toLowerCase();

        // 🔓 ROUTES PUBLIQUES : 
        // - Landing Page sur elite
        // - Pages d'auth (/auth/login, etc)
        // - Assets statiques
        if (
          (pathname === "/" && subdomain === "elite") || 
          pathname.startsWith("/auth")
        ) {
          return true;
        }
        
        // 🔒 TOUT LE RESTE demande un token
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