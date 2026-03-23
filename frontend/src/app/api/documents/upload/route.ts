// frontend/src/app/api/documents/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs'; // ✅ Force Node.js runtime pour multipart

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const fileName = formData.get('fileName') as string;
    const fileType = formData.get('fileType') as string;
    
    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 });
    }
    
    // TODO: Implémenter l'upload vers ton stockage (S3, MinIO, ou filesystem)
    // Pour l'exemple, on retourne une URL fictive
    const fileUrl = `/storage/documents/${Date.now()}-${fileName}`;
    
    return NextResponse.json({ fileUrl }, { status: 201 });
  } catch (error) {
    console.error('❌ Erreur upload document:', error);
    return NextResponse.json({ error: 'Échec de l\'upload' }, { status: 500 });
  }
}