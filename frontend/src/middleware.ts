/* eslint-disable @typescript-eslint/no-explicit-any */
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const { pathname, hostname } = req.nextUrl;
  
  // 🚩 DÉTECTION SIMPLE DU SOUS-DOMAINE
  const subdomain = hostname.split('.')[0].toLowerCase();
  const isProduction = process.env.NODE_ENV === "production";

  // 🔓 1. ACCÈS PUBLICS (Elite Landing & Auth)
  const isElite = (subdomain === "elite" || subdomain === "www");
  const isAuthPage = pathname.startsWith("/auth");
  const isStatic = pathname.startsWith("/_next") || pathname.includes(".") || pathname.startsWith("/favicon.ico");

  if (isAuthPage || isStatic) return NextResponse.next();

  // 🚩 CAS ÉLITE : Affiche la Landing Page sur la racine
  if (pathname === "/" && isElite) {
    return NextResponse.next();
  }

  // 🔒 2. VÉRIFICATION DE LA SESSION
  const token = await getToken({ 
    req, 
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie: isProduction
  });

  // 🚪 3. REDIRECTION LOGIN (Si pas de session)
  if (!token) {
    // Si on est sur pad.qualisoft.sn/ -> Login
    if (pathname === "/" || pathname.startsWith("/dashboard")) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }
  }

  // 🏢 4. PROTECTION DES TENANTS (Sans reconstruction d'URL)
  if (pathname.startsWith("/dashboard") && token) {
    const assignedTenant = (token as any)?.U_TenantDomain?.toLowerCase();
    
    // Si on n'est pas sur le bon sous-domaine
    if (assignedTenant && subdomain !== assignedTenant && (token as any)?.U_Role !== "SUPER_ADMIN") {
        // Redirection vers le bon sous-domaine sans concaténation manuelle
        return NextResponse.redirect(`https://${assignedTenant}.qualisoft.sn/dashboard`);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};