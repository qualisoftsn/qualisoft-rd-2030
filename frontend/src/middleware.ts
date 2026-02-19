import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname, hostname } = req.nextUrl;
    const subdomain = hostname.split('.')[0].toLowerCase();

    // Si on est sur un sous-domaine (ex: pad) et qu'on tape la racine /
    // On force la redirection vers le login du tenant
    if (pathname === "/" && !['elite', 'www', 'localhost'].includes(subdomain)) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname, hostname } = req.nextUrl;
        const subdomain = hostname.split('.')[0].toLowerCase();

        // Accès publics : Landing Elite et Pages d'Auth
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