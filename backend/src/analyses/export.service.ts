import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';

@Injectable()
export class ExportService {
  /**
   * 📑 GÉNÉRATION DU PLAN D'ACTION PDF
   * Construit le document à partir des données réelles du SMI
   */
  async generateActionPlanPDF(actions: any[]): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
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
          // Mapping conforme aux préfixes ACT_
          const title = action.ACT_Title || action.title || 'N/A';
          const resp = action.ACT_Responsable?.U_LastName || action.responsible || '---';
          const deadline = action.ACT_Deadline || action.dueDate;

          doc.text(action.ACT_Id?.substring(0, 5) || '---', 50, y);
          doc.text(title, 100, y, { width: 180 });
          doc.text(resp, 300, y);
          doc.text(deadline ? new Date(deadline).toLocaleDateString('fr-FR') : '---', 400, y);
          doc.text(action.ACT_Status || action.status || '---', 500, y);
          
          y += 30;
          if (y > 700) { doc.addPage(); y = 50; }
        });

        // --- FOOTER ---
        doc.fontSize(8).text('Document certifié Qualisoft RD 2030 - Système de Management Intégré', 50, 780, { align: 'center' });

        doc.end();
      } catch (err: unknown) {
        reject(err);
      }
    });
  }
}