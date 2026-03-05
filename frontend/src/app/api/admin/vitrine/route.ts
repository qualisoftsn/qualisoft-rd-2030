/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { prisma } from "@/core/lib/prisma";
import { cookies } from "next/headers";
import * as jwt from "jsonwebtoken";
import { Role } from "@/types/elite-sde";

/**
 * 🛰️ MODULE API : GESTION VITRINE (elite-sde)
 * -------------------------------------------------------------------------
 * RÔLE : CRUD sécurisé pour le contenu de la vitrine publique.
 * SÉCURITÉ : Lecture directe du Cookie HttpOnly + Vérification JWT.
 * RÉVISION : 04 Mars 2026 | 23:25 GMT
 * -------------------------------------------------------------------------
 */

async function getSession() {
  const cookieStore = await cookies();
  // 🚩 Lecture du sceau injecté par le login
  const token = cookieStore.get("access_token")?.value;

  if (!token) return null;

  try {
    return jwt.verify(token, process.env.JWT_SECRET || "qualipass2026") as any;
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    const session = await getSession();
    
    // 🛡️ Vérification d'autorité stricte
    if (!session || session.U_Role !== Role.SUPER_ADMIN) {
      return NextResponse.json({ success: false, error: "Accès Matrix Refusé : Autorité insuffisante." }, { status: 403 });
    }

    const contents = await prisma.vitrineContent.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, data: contents }, { status: 200 });
  } catch (error) {
    console.error("[VITRINE_GET_ERROR]:", error);
    return NextResponse.json({ success: false, error: "Erreur Critique du Serveur Matrix" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    
    if (!session || session.U_Role !== Role.SUPER_ADMIN) {
      return NextResponse.json({ success: false, error: "Action Non Autorisée" }, { status: 403 });
    }

    const body = await req.json();
    const { id, title, slug, type, content, catch: catchPhrase, features, published } = body;

    const result = await prisma.vitrineContent.upsert({
      where: { id: id || 'new' },
      update: { title, slug, type, content, catch: catchPhrase, features, published },
      create: { title, slug, type, content, catch: catchPhrase, features, published },
    });

    return NextResponse.json({ success: true, data: result }, { status: 200 });
  } catch (error) {
    console.error("[VITRINE_POST_ERROR]:", error);
    return NextResponse.json({ success: false, error: "Échec de scellage Matrix" }, { status: 500 });
  }
}