import { NextResponse } from "next/server";
import { prisma } from "@/core/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const slug = searchParams.get("slug");

  try {
    // Si on cherche un article précis par son slug
    if (slug) {
      const item = await prisma.vitrineContent.findUnique({
        where: { slug, published: true }
      });
      return NextResponse.json(item);
    }

    // Sinon on récupère tout par type (ex: toutes les formations)
    const contents = await prisma.vitrineContent.findMany({
      where: { 
        ...(type ? { type } : {}),
        published: true 
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(contents);
  } catch (error) {
    return NextResponse.json({ error: "Contenu indisponible" }, { status: 500 });
  }
}