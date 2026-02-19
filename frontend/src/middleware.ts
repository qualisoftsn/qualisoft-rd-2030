import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname, hostname } = req.nextUrl;
    const subdomain = hostname.split('.')[0].toLowerCase();

    // 🚩 RÈGLE D'OR : La racine d'Elite est PUBLIQUE (Landing Page)
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

        // On autorise sans login : 
        // 1. La racine de elite.qualisoft.sn
        // 2. Toutes les pages dans /auth/
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