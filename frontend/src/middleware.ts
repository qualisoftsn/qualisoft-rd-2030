import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname, hostname } = req.nextUrl;
    const subdomain = hostname.split('.')[0].toLowerCase();

    // 🚩 AUTORISATION : La racine d'Elite est PUBLIQUE
    if (subdomain === "elite" && pathname === "/") {
      return NextResponse.next();
    }

    // 🚩 RESTRICTION : Les racines des tenants (pad, sagam) vont au login
    if (pathname === "/" && subdomain !== "elite") {
        return NextResponse.redirect(new URL("/auth/login", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname, hostname } = req.nextUrl;
        const subdomain = hostname.split('.')[0].toLowerCase();

        // Pages publiques : Racine Elite et toutes les pages /auth/*
        if ((pathname === "/" && subdomain === "elite") || pathname.startsWith("/auth")) {
          return true;
        }
        return !!token;
      },
    },
    pages: { signIn: "/auth/login" }
  }
);

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico|uploads|images|.*\\..*).*)"],
};