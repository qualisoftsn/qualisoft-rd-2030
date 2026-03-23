// frontend/src/app/api/documents/[id]/versions/[versionId]/download/route.ts
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; versionId: string } }
) {
  try {
    const { id, versionId } = params;
    
    // TODO: Récupérer le fichier depuis ton stockage
    // Pour l'exemple, on retourne une erreur simulée
    return NextResponse.json(
      { error: 'Endpoint de téléchargement à implémenter' },
      { status: 501 }
    );
  } catch (error) {
    console.error('❌ Erreur téléchargement:', error);
    return NextResponse.json({ error: 'Échec du téléchargement' }, { status: 500 });
  }
}