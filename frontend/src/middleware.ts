import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname, hostname } = req.nextUrl;
    const subdomain = hostname.split('.')[0].toLowerCase();

    // 🚩 Si on est sur elite.qualisoft.sn, la racine (/) est PUBLIQUE
    if (subdomain === "elite" && pathname === "/") {
      return NextResponse.next();
    }
    
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname, hostname } = req.nextUrl;
        const subdomain = hostname.split('.')[0].toLowerCase();

        // On laisse passer sans login : 
        // 1. La racine d'Elite (Landing Page)
        // 2. Toutes les pages /auth/*
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