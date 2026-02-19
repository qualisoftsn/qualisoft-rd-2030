/* eslint-disable @typescript-eslint/no-explicit-any */
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const { pathname, hostname } = req.nextUrl;
  
  // 🚩 DÉTECTION ROBUSTE : Gère "elite.qualisoft.sn" et "www.elite.qualisoft.sn"
  const hostParts = hostname.split('.');
  const subdomain = hostParts.length > 2 ? hostParts[hostParts.length - 3].toLowerCase() : "";

  const isProduction = process.env.NODE_ENV === "production";
  
  // 🔓 1. ACCÈS PUBLICS : Elite (Landing) et Auth
  const isLandingElite = (subdomain === "elite" || subdomain === "www") && pathname === "/";
  const isAuthPage = pathname.startsWith("/auth");
  const isStaticFile = pathname.startsWith("/_next") || 
                       pathname.includes(".") || 
                       pathname.startsWith("/favicon.ico");

  if (isLandingElite || isAuthPage || isStaticFile) {
    return NextResponse.next();
  }

  // 🔒 2. VÉRIFICATION DE LA SESSION
  // On utilise exactement la même logique de sécurité que dans route.ts
  const token = await getToken({ 
    req, 
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie: isProduction
  });

  // 🚪 3. REDIRECTION LOGIN
  // Si pas de session et qu'on n'est pas sur une page publique
  if (!token) {
    const loginUrl = new URL("/auth/login", req.url);
    // On peut ajouter un paramètre de callback si besoin plus tard
    return NextResponse.redirect(loginUrl);
  }

  // 🏢 4. PROTECTION DES TENANTS (Dashboard)
  if (pathname.startsWith("/dashboard")) {
    const assignedTenant = (token as any)?.U_TenantDomain?.toLowerCase();
    const currentSubdomain = subdomain;
    
    // Si l'utilisateur tente d'accéder à un autre tenant que le sien (hors Super Admin)
    if (assignedTenant && currentSubdomain !== assignedTenant && (token as any)?.U_Role !== "SUPER_ADMIN") {
        const targetUrl = req.nextUrl.clone();
        targetUrl.host = `${assignedTenant}.qualisoft.sn`;
        return NextResponse.redirect(targetUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};