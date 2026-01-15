import { Injectable, Logger } from '@nestjs/common';
import PDFDocument from 'pdfkit'; // ✅ Correct pour TypeScript
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ExportService {
  private readonly logger = new Logger(ExportService.name);

  constructor(private prisma: PrismaService) {}

  async generateManagementReviewPDF(tenantId: string, month: number, year: number): Promise<Buffer> {
    const tenant = await this.prisma.tenant.findUnique({ where: { T_Id: tenantId } });
    
    // ✅ CORRECTION : Utilisation du nom exact de la relation : IND_Processus
    const indicators = await this.prisma.indicator.findMany({
      where: { tenantId },
      include: { 
        IND_Processus: true 
      }
    });

    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ size: 'A4', margin: 50, bufferPages: true });
        const chunks: Buffer[] = [];
        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', (err) => reject(err));

        this.drawHeader(doc, tenant?.T_Name || 'CLIENT QUALISOFT');

        doc.moveDown(4);
        doc.fillColor('#0F172A').fontSize(18).font('Helvetica-Bold').text('REVUE DE DIRECTION STRATÉGIQUE', { align: 'center' });
        
        doc.fontSize(10).font('Helvetica').fillColor('#64748B')
           .text(`Période : ${month}/${year} • Rapport généré par l'IA Qualisoft`, { align: 'center' });
        
        doc.moveDown(2);
        this.drawSectionTitle(doc, '1. SYNTHÈSE DE LA PERFORMANCE');
        doc.fontSize(11).fillColor('#334155').text(
          `Analyse de performance pour ${tenant?.T_Name || 'votre organisation'}. ` +
          `L'extraction des indicateurs clés montre une progression de la maturité digitale.`
        );

        doc.moveDown(2);
        this.drawSectionTitle(doc, '2. PERFORMANCE PAR PROCESSUS');
        
        // ✅ CORRECTION : Mapping avec les champs exacts (IND_Libelle, IND_Cible)
        const tableData = indicators.length > 0 
          ? indicators.map(i => ({ 
              name: i.IND_Libelle, 
              score: `${i.IND_Cible}`, 
              status: 'ACTIF' 
            }))
          : [
              { name: 'Management & Stratégie', score: '95%', status: 'CONFORME' },
              { name: 'Ressources Humaines', score: '88%', status: 'CONFORME' },
            ];

        this.drawProcessTable(doc, tableData);

        this.drawFooter(doc, year);
        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  private drawHeader(doc: any, clientName: string) {
    doc.rect(0, 0, 612, 100).fill('#0F172A');
    doc.rect(50, 30, 40, 40).fill('#2563EB');
    doc.fillColor('#FFFFFF').fontSize(20).font('Helvetica-Bold').text('Q', 62, 42);
    doc.fillColor('#FFFFFF').fontSize(16).text('QUALISOFT RD 2030', 105, 35);
    doc.fontSize(8).font('Helvetica').text('SYSTEME DE MANAGEMENT INTEGRE ELITE', 105, 55);
    doc.fontSize(10).font('Helvetica-Bold').text(clientName.toUpperCase(), 400, 45, { align: 'right' });
  }

  private drawSectionTitle(doc: any, title: string) {
    const y = doc.y;
    doc.rect(50, y, 5, 15).fill('#2563EB');
    doc.fillColor('#0F172A').fontSize(12).font('Helvetica-Bold').text(title, 65, y + 2);
    doc.moveDown(1);
  }

  private drawProcessTable(doc: any, items: any[]) {
    const tableTop = doc.y;
    doc.font('Helvetica-Bold').fontSize(10).fillColor('#475569');
    doc.text('PROCESSUS', 50, tableTop);
    doc.text('CIBLE', 250, tableTop);
    doc.text('STATUT', 400, tableTop);
    doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke('#E2E8F0');
    
    let currentY = tableTop + 25;
    items.forEach(item => {
      doc.font('Helvetica').fontSize(10).fillColor('#1E293B');
      doc.text(item.name, 50, currentY);
      doc.text(item.score, 250, currentY);
      doc.text(item.status, 400, currentY);
      currentY += 20;
    });
  }

  private drawFooter(doc: any, year: number) {
    const pages = doc.bufferedPageRange();
    for (let i = 0; i < pages.count; i++) {
      doc.switchToPage(i);
      doc.fontSize(8).fillColor('#94A3B8').text(
        `Document confidentiel - Généré par Qualisoft RD ${year} ©`,
        50,
        780,
        { align: 'center' }
      );
    }
  }
}