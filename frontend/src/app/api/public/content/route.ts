/**
 * 🛰️ MODULE API : PUBLIC CONTENT (elite-sde)
 * -------------------------------------------------------------------------
 * RÔLE : Accès en lecture seule (non authentifié) au contenu de la vitrine.
 * RÉVISION : 04 Mars 2026 | 23:37 GMT
 * -------------------------------------------------------------------------
 */

import { NextResponse } from "next/server";
import { prisma } from "@/core/lib/prisma"; // Alignement avec l'architecture SDE

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const slug = searchParams.get("slug");

    if (slug) {
      const item = await prisma.vitrineContent.findUnique({
        where: { slug, published: true }
      });
      if (!item) return NextResponse.json({ success: false, error: "Contenu introuvable" }, { status: 404 });
      return NextResponse.json({ success: true, data: item });
    }

    const contents = await prisma.vitrineContent.findMany({
      where: { 
        ...(type ? { type } : {}),
        published: true 
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, data: contents });
  } catch (error) {
    console.error('[PUBLIC_CONTENT_ERROR]:', error);
    return NextResponse.json({ success: false, error: "Rupture de liaison base de données" }, { status: 500 });
  }
}