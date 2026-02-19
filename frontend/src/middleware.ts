import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  // 🚩 1. DÉTECTION BLINDÉE DU DOMAINE (Contourne la cécité Docker)
  // On lit d'abord ce que Nginx nous transmet formellement
  const hostHeader = req.headers.get('x-forwarded-host') || req.headers.get('host') || req.nextUrl.hostname;
  const cleanHost = hostHeader.split(':')[0]; // On enlève le port s'il est présent (ex: :3005)
  const subdomain = cleanHost.split('.')[0].toLowerCase();

  const isProduction = process.env.NODE_ENV === "production";

  // 🔓 2. ZONES PUBLIQUES
  const isElite = (subdomain === "elite" || subdomain === "www");
  const isAuthPage = req.nextUrl.pathname.startsWith("/auth");
  const isStatic = req.nextUrl.pathname.startsWith("/_next") || req.nextUrl.pathname.includes(".");

  if (isAuthPage || isStatic) return NextResponse.next();

  // 🎯 3. GESTION DE LA RACINE (/)
  if (req.nextUrl.pathname === "/") {
    if (isElite) {
      // 🚩 ELITE EST ENFIN RECONNU ET AFFICHE LA LANDING PAGE
      return NextResponse.next(); 
    }
    // Les tenants (pad, sagam...) vont au login
    return NextResponse.redirect(new URL("/auth/login", req.url)); 
  }

  // 🔒 4. VÉRIFICATION DE LA SESSION POUR LE RESTE (Dashboard, etc.)
  const qsCookieName = `${isProduction ? "__Secure-" : ""}qs.tenant.token`;
  const token = await getToken({ 
    req, 
    secret: process.env.NEXTAUTH_SECRET,
    cookieName: qsCookieName, 
    secureCookie: isProduction
  });

  if (!token && req.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};