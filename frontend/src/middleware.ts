import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const { pathname, hostname } = req.nextUrl;
  const subdomain = hostname.split('.')[0].toLowerCase();
  const isProduction = process.env.NODE_ENV === "production";

  // 1. ZONES PUBLIQUES
  const isElite = (subdomain === "elite" || subdomain === "www");
  const isAuthPage = pathname.startsWith("/auth");
  const isStatic = pathname.startsWith("/_next") || pathname.includes(".");

  if (isAuthPage || isStatic) return NextResponse.next();

  // 2. GESTION DES RACINES (/)
  if (pathname === "/") {
    if (isElite) return NextResponse.next(); // 🚩 ELITE AFFICHE LA LANDING
    return NextResponse.redirect(new URL("/auth/login", req.url)); // 🚩 LES TENANTS VONT AU LOGIN
  }

  // 3. VÉRIFICATION DE LA SESSION AVEC LE NOUVEAU COOKIE
  const cookiePrefix = isProduction ? "__Secure-" : "";
  const qsCookieName = `${cookiePrefix}qs.tenant.token`; // Le nouveau nom défini dans route.ts

  const token = await getToken({ 
    req, 
    secret: process.env.NEXTAUTH_SECRET,
    cookieName: qsCookieName, 
    secureCookie: isProduction
  });

  // Si pas de session et tentative d'accès au dashboard
  if (!token && pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};