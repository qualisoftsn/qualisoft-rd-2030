/* eslint-disable @typescript-eslint/no-explicit-any */
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const { pathname, hostname } = req.nextUrl;
  
  // 🚩 EXTRACTION DU SOUS-DOMAINE (pad.qualisoft.sn -> pad)
  const hostParts = hostname.split('.');
  const subdomain = hostParts.length > 2 ? hostParts[hostParts.length - 3].toLowerCase() : "";

  const isProduction = process.env.NODE_ENV === "production";
  
  // 🔓 1. LES PASSAGES PUBLICS (Elite Landing & Auth)
  const isElite = (subdomain === "elite" || subdomain === "www");
  const isAuthPage = pathname.startsWith("/auth");
  const isStatic = pathname.startsWith("/_next") || pathname.includes(".") || pathname.startsWith("/favicon.ico");

  if (isAuthPage || isStatic) return NextResponse.next();

  // 🚩 CAS CRITIQUE : La racine "/"
  if (pathname === "/") {
    if (isElite) {
      return NextResponse.next(); // Affiche la Landing Page Elite
    } else {
      // 🚫 TOUS LES AUTRES (pad, sagam, etc.) -> Direction LOGIN
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }
  }

  // 🔒 2. VÉRIFICATION DE LA SESSION (Pour le dashboard, etc.)
  const token = await getToken({ 
    req, 
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie: isProduction
  });

  // Si pas de session sur une page privée
  if (!token && !isAuthPage) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  // 🏢 3. PROTECTION DES FRONTIÈRES (Isolation des Tenants)
  if (pathname.startsWith("/dashboard") && token) {
    const assignedTenant = (token as any)?.U_TenantDomain?.toLowerCase();
    
    // Si je suis sur pad.qualisoft.sn avec un compte SAGAM (et pas Super Admin)
    if (assignedTenant && subdomain !== assignedTenant && (token as any)?.U_Role !== "SUPER_ADMIN") {
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