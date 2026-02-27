import { NextResponse } from "next/server";
import { prisma } from "@/core/lib/prisma";
import { cookies } from "next/headers";
import * as jwt from "jsonwebtoken"; // Assure-toi que jsonwebtoken est installé (npm install jsonwebtoken)

/**
 * 🔐 FONCTION INTERNE DE VÉRIFICATION DE SESSION
 */
async function getSession() {
  const cookieStore = await cookies();
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
    
    // Vérification du rôle via ton typage Elite
    if (!session || session.U_Role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: "Accès Matrix Refusé" }, { status: 403 });
    }

    const contents = await prisma.vitrineContent.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(contents);
  } catch (error) {
    return NextResponse.json({ error: "Erreur Serveur Matrix" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.U_Role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: "Action Non Autorisée" }, { status: 403 });
    }

    const body = await req.json();
    const { id, title, slug, type, content, catch: catchPhrase, features, published } = body;

    const result = await prisma.vitrineContent.upsert({
      where: { id: id || 'new' },
      update: { title, slug, type, content, catch: catchPhrase, features, published },
      create: { title, slug, type, content, catch: catchPhrase, features, published },
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: "Échec de synchronisation Matrix" }, { status: 500 });
  }
}