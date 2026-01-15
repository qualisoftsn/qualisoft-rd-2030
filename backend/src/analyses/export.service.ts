import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit'; // ✅ Correct pour TypeScript
import { Action } from '@prisma/client';

@Injectable()
export class ExportService {
  async generateActionPlanPDF(actions: any[]): Promise<Buffer> {
    return new Promise((resolve) => {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      // --- HEADER ---
      doc.fillColor('#1e293b').fontSize(20).text('RAPPORT : PLAN D\'ACTION QSE', { underline: true });
      doc.fontSize(10).text(`Généré le : ${new Date().toLocaleDateString('fr-FR')}`, { align: 'right' });
      doc.moveDown(2);

      // --- TABLEAU DES ACTIONS ---
      const tableTop = 150;
      doc.fontSize(10).font('Helvetica-Bold');
      doc.text('ID', 50, tableTop);
      doc.text('Titre de l\'action', 100, tableTop);
      doc.text('Responsable', 300, tableTop);
      doc.text('Échéance', 400, tableTop);
      doc.text('Statut', 500, tableTop);

      doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

      let y = tableTop + 30;
      doc.font('Helvetica');

      actions.forEach((action) => {
        doc.text(action.id.substring(0, 5), 50, y);
        doc.text(action.title, 100, y, { width: 180 });
        doc.text(action.responsible, 300, y);
        doc.text(new Date(action.dueDate).toLocaleDateString('fr-FR'), 400, y);
        doc.text(action.status, 500, y);
        
        y += 30; // Espace entre les lignes
        if (y > 700) { doc.addPage(); y = 50; } // Saut de page si nécessaire
      });

      // --- FOOTER ---
      doc.fontSize(8).text('Document certifié Qualisoft RD 2030 - Système de Management Intégré', 50, 780, { align: 'center' });

      doc.end();
    });
  }
}