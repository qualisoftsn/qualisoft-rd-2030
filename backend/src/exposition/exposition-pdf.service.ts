import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { ExpositionService } from './exposition.service';

@Injectable()
export class ExpositionPdfService {
  constructor(private expositionService: ExpositionService) {}

  /**
   * 📑 GÉNÉRATION DE LA FICHE D'EXPOSITION INDIVIDUELLE
   * Document officiel pour le dossier du personnel et la médecine du travail
   */
  async generateFicheExposition(userId: string, tenantId: string): Promise<Buffer> {
    const data = await this.expositionService.getCollaborateurExposition(userId, tenantId);

    return new Promise((resolve) => {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      // --- EN-TÊTE ---
      doc.fillColor('#1e293b').fontSize(18).text('FICHE INDIVIDUELLE D\'EXPOSITION', { underline: true });
      doc.fontSize(10).text(`Établie le : ${new Date().toLocaleDateString('fr-FR')}`, { align: 'right' });
      doc.moveDown(2);

      // --- INFOS COLLABORATEUR ---
      doc.fontSize(12).font('Helvetica-Bold').text(`Collaborateur : ${data.collaborateur}`);
      doc.font('Helvetica').text(`Unité de travail : ${data.unite}`);
      doc.moveDown(2);

      // --- TABLEAU DES RISQUES ---
      doc.fontSize(12).font('Helvetica-Bold').text('INVENTAIRE DES RISQUES ET EXPOSITIONS');
      doc.moveTo(50, doc.y + 5).lineTo(550, doc.y + 5).stroke();
      doc.moveDown();

      let y = doc.y;
      doc.fontSize(10).font('Helvetica-Bold');
      doc.text('RISQUE', 50, y);
      doc.text('CRITICITÉ', 250, y);
      doc.text('MESURES DE PRÉVENTION', 350, y);

      doc.font('Helvetica').fontSize(9);
      data.risques.forEach(r => {
        y += 25;
        doc.text(r.libelle, 50, y, { width: 180 });
        doc.text(r.score.toString(), 250, y);
        doc.text(r.mesures || 'Port des EPI standard', 350, y, { width: 200 });
        
        if (y > 700) { doc.addPage(); y = 50; }
      });

      // --- FOOTER ---
      doc.fontSize(8).text('Document généré par Qualisoft RD 2030 - Conformité Réglementaire SSE', 50, 780, { align: 'center' });

      doc.end();
    });
  }
}