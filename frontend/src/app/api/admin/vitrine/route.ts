import { NextResponse } from "next/server";
import { prisma } from "@/core/lib/prisma";
import { getAuthSession } from "@/core/lib/auth-utils"; // Ta fonction de vérification de session custom

/**
 * GET : Récupère tous les contenus pour le Matrix Control
 */
export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session || session.user.role !== 'SUPER_ADMIN') {
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

/**
 * POST : Crée ou met à jour un contenu vitrine
 */
export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: "Action Non Autorisée" }, { status: 403 });
    }

    const body = await req.json();
    const { id, title, slug, type, content, catch: catchPhrase, features, published } = body;

    const data = {
      title,
      slug,
      type,
      content,
      catch: catchPhrase,
      features,
      published
    };

    const result = await prisma.vitrineContent.upsert({
      where: { id: id || 'new' },
      update: data,
      create: data,
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: "Échec de synchronisation Vitrine" }, { status: 500 });
  }
}