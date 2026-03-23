// frontend/src/app/api/quiz/pdf/route.ts
import { NextRequest, NextResponse } from 'next/server';
import PDFDocument from 'pdfkit';
import { Readable } from 'stream';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

interface QuizResult {
  percentage: number;
  level: string;
  recommendations: string[];
  details: Array<{
    clause: string;
    question: string;
    answer: string;
    weight: number;
  }>;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { result, questions } = body as { result: QuizResult; questions: any[] };

    if (!result || !result.details) {
      return NextResponse.json(
        { error: 'Données de quiz invalides' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Création du document PDF
    const doc = new PDFDocument({ 
      size: 'A4', 
      margins: { top: 50, bottom: 50, left: 50, right: 50 } 
    });

    // Convertir le stream en buffer
    const chunks: Buffer[] = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    
    const pdfPromise = new Promise<Buffer>((resolve, reject) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);
    });

    // === EN-TÊTE ===
    // Background bleu
    doc.rect(0, 0, 595, 80).fill('#0B0F1A');
    
    // Logo / Titre
    doc.fillColor('#FFFFFF')
       .fontSize(24)
       .font('Helvetica-Bold')
       .text('QUALISOFT ELITE', 50, 25, { align: 'left' });
    
    doc.fontSize(12)
       .font('Helvetica')
       .text('Rapport de Maturité SMI - ISO 9001:2015', 50, 55, { align: 'left' });
    
    // Date
    doc.fontSize(10)
       .fillColor('#94A3B8')
       .text(`Généré le ${new Date().toLocaleDateString('fr-SN', { 
         day: '2-digit', 
         month: 'long', 
         year: 'numeric' 
       })}`, 50, 75, { align: 'right' });

    // === SCORE PRINCIPAL ===
    doc.fillColor('#3B82F6')
       .fontSize(72)
       .font('Helvetica-Bold')
       .text(`${result.percentage}%`, 0, 130, { align: 'center' });
    
    doc.fillColor('#64748B')
       .fontSize(14)
       .font('Helvetica')
       .text('Score de maturité global', 0, 175, { align: 'center' });

    // === NIVEAU ===
    const levelColors: Record<string, string> = {
      'NIVEAU_1': '#F43F5E',
      'NIVEAU_2': '#F59E0B',
      'NIVEAU_3': '#3B82F6',
      'NIVEAU_4': '#10B981',
      'NIVEAU_5': '#6366F1',
    };
    
    doc.fillColor(levelColors[result.level] || '#3B82F6')
       .fontSize(18)
       .font('Helvetica-Bold')
       .text(result.level.replace('_', ' '), 0, 220, { align: 'center' });

    // === RECOMMANDATIONS ===
    doc.fillColor('#1E293B')
       .fontSize(16)
       .font('Helvetica-Bold')
       .text('Recommandations Prioritaires', 50, 270, { align: 'left' });
    
    doc.fontSize(11)
       .font('Helvetica')
       .fillColor('#475569');
    
    let yPos = 295;
    result.recommendations.forEach((rec: string, i: number) => {
      doc.text(`${i + 1}. ${rec}`, 50, yPos, { 
        align: 'left', 
        width: 495, 
        lineGap: 8 
      });
      yPos += 20 + (rec.length > 80 ? 15 : 0);
    });

    // === TABLEAU DÉTAILS PAR CLAUSE ===
    yPos += 20;
    doc.fillColor('#1E293B')
       .fontSize(16)
       .font('Helvetica-Bold')
       .text('Détail par Clause ISO 9001', 50, yPos, { align: 'left' });
    
    yPos += 25;
    
    // En-têtes du tableau
    doc.fontSize(9)
       .font('Helvetica-Bold')
       .fillColor('#FFFFFF');
    
    doc.rect(50, yPos - 5, 100, 20).fill('#3B82F6');
    doc.text('Clause', 55, yPos, { align: 'left' });
    
    doc.rect(155, yPos - 5, 300, 20).fill('#3B82F6');
    doc.text('Question', 160, yPos, { align: 'left' });
    
    doc.rect(460, yPos - 5, 85, 20).fill('#3B82F6');
    doc.text('Réponse', 465, yPos, { align: 'left' });
    
    yPos += 20;
    
    // Lignes du tableau
    doc.fontSize(8)
       .font('Helvetica')
       .fillColor('#475569');
    
    result.details.forEach((detail, i) => {
      const answerColor = detail.answer === 'OUI' ? '#10B981' : 
                         detail.answer === 'UN PEU' ? '#F59E0B' : '#F43F5E';
      
      doc.text(detail.clause, 55, yPos, { align: 'left', width: 95 });
      doc.text(detail.question.substring(0, 50) + (detail.question.length > 50 ? '...' : ''), 160, yPos, { 
        align: 'left', 
        width: 295,
        lineGap: 3
      });
      
      doc.fillColor(answerColor)
         .font('Helvetica-Bold')
         .text(detail.answer, 465, yPos, { align: 'left' });
      
      doc.fillColor('#475569')
         .font('Helvetica');
      
      yPos += 25;
      
      // Nouvelle page si nécessaire
      if (yPos > 750) {
        doc.addPage();
        yPos = 50;
      }
    });

    // === PIED DE PAGE ===
    doc.fillColor('#94A3B8')
       .fontSize(9)
       .font('Helvetica')
       .text('Rapport généré par Qualisoft Elite • ISO 9001:2015 • Confidential', 0, 820, { align: 'center' });
    
    doc.fillColor('#64748B')
       .fontSize(8)
       .text(`${process.env.NEXT_PUBLIC_COMPANY_NAME} • ${process.env.NEXT_PUBLIC_COMPANY_PHONE}`, 0, 835, { align: 'center' });

    // Finaliser le PDF
    doc.end();

    // Attendre que le PDF soit généré
    const pdfBuffer = await pdfPromise;

    // Retourner le PDF
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="rapport-maturite-smi-${new Date().toISOString().split('T')[0]}.pdf"`,
      },
    });

  } catch (error) {
    console.error('❌ Erreur génération PDF:', error);
    return NextResponse.json(
      { error: 'Échec de génération du rapport PDF' },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}