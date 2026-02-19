import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const { pathname, hostname } = req.nextUrl;
  const subdomain = hostname.split('.')[0].toLowerCase();

  const isElite = (subdomain === "elite" || subdomain === "www");
  const isAuthPage = pathname.startsWith("/auth");
  const isStatic = pathname.startsWith("/_next") || pathname.includes(".");

  if (isAuthPage || isStatic) return NextResponse.next();

  // 🚩 GESTION DES TERRITOIRES
  if (pathname === "/") {
    // Si on est sur elite.qualisoft.sn -> Affiche Landing Page
    if (isElite) return NextResponse.next();
    
    // Si on est sur pad.qualisoft.sn -> Redirige au LOGIN du tenant
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  // 🔒 VÉRIFICATION SESSION
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token && pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};