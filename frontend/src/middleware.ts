import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname, hostname } = req.nextUrl;
    const subdomain = hostname.split('.')[0].toLowerCase();

    // 🚩 RÈGLE D'OR : La racine (/) n'est autorisée QUE pour "elite"
    if (pathname === "/") {
      if (subdomain === "elite") return NextResponse.next();
      
      // Si on est sur pad.qualisoft.sn/ -> REDIRECTION LOGIN
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }
    
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname, hostname } = req.nextUrl;
        const subdomain = hostname.split('.')[0].toLowerCase();

        // Accès publics : Racine Elite et pages /auth/*
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