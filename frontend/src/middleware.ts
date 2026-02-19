import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const { pathname, hostname } = req.nextUrl;
  const subdomain = hostname.split('.')[0].toLowerCase();

  const isLandingElite = (subdomain === "elite") && pathname === "/";
  const isAuthPage = pathname.startsWith("/auth");
  const isStaticFile = pathname.startsWith("/_next") || pathname.includes(".");

  // 🔓 Accès libre pour Elite et l'Auth
  if (isLandingElite || isAuthPage || isStaticFile) {
    return NextResponse.next();
  }

  const token = await getToken({ 
    req, 
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie: true
  });

  // 🔒 Redirection login pour les tenants non connectés
  if (!token && pathname === "/") {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};