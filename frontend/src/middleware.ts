import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname, hostname } = req.nextUrl;
    const subdomain = hostname.split('.')[0].toLowerCase();

    // 🚩 RÈGLE CRITIQUE : Si on est sur elite.qualisoft.sn, la racine (/) est publique
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

        // ACCÈS PUBLICS :
        // 1. Racine de elite.qualisoft.sn
        // 2. Toutes les pages /auth/* (login, error, etc.)
        if (
          (pathname === "/" && subdomain === "elite") || 
          pathname.startsWith("/auth")
        ) return true;

        // Le reste demande une session
        return !!token;
      },
    },
    pages: { signIn: "/auth/login" }
  }
);

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico|uploads|images|.*\\..*).*)"],
};