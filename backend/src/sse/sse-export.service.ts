import { Injectable, NotFoundException } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SseExportService {
  constructor(private prisma: PrismaService) {}

  async generateExpositionPDF(userId: string, tenantId: string): Promise<Buffer> {
    const user = await this.prisma.user.findFirst({
      where: { U_Id: userId, tenantId },
      include: {
        U_OrgUnit: true,
      }
    });

    if (!user) throw new NotFoundException("Collaborateur introuvable.");

    // ✅ CORRECTION DE LA REQUÊTE : 
    // On cherche les risques rattachés aux processus dont l'utilisateur est soit le Pilote, soit le Co-Pilote, 
    // ou qui appartiennent à son Unité Organique via la relation transversale.
    const risks = await this.prisma.risk.findMany({
      where: {
        tenantId,
        RS_IsActive: true,
        RS_Processus: {
          OR: [
            { PR_PiloteId: userId },
            { PR_CoPiloteId: userId },
            { PR_Id: user.U_OrgUnitId || undefined }
          ]
        }
      },
      include: { 
        RS_Type: true,
        RS_Processus: true 
      }
    });

    return new Promise((resolve) => {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      // --- DESIGN ELITE PDF (Optimisé) ---
      doc.rect(0, 0, 600, 80).fill('#0f172a');
      doc.fillColor('#ffffff').fontSize(16).font('Helvetica-Bold').text("QUALISOFT ELITE - SÉCURITÉ AU TRAVAIL", 50, 35);
      
      doc.fillColor('#1e293b').fontSize(14).text("FICHE INDIVIDUELLE D'EXPOSITION AUX RISQUES", 50, 100, { underline: true });
      doc.fontSize(8).text(`ÉDITÉ LE : ${new Date().toLocaleString('fr-FR')}`, 450, 105);

      // --- DATA COLLABORATEUR ---
      doc.roundedRect(50, 140, 500, 80, 10).strokeColor('#e2e8f0').stroke();
      doc.fillColor('#0f172a').fontSize(10).font('Helvetica-Bold').text(`COLLABORATEUR : ${user.U_FirstName} ${user.U_LastName}`, 70, 155);
      doc.font('Helvetica').text(`EMAIL : ${user.U_Email}`, 70, 175);
      doc.text(`UNITÉ : ${user.U_OrgUnit?.OU_Name || 'NON DÉFINIE'}`, 70, 195);

      // --- TABLEAU DUER ---
      doc.moveDown(4);
      doc.fontSize(11).font('Helvetica-Bold').text('ÉVALUATION DES RISQUES IDENTIFIÉS (DUER)');
      
      let y = doc.y + 10;
      doc.rect(50, y, 500, 20).fill('#f1f5f9');
      doc.fillColor('#475569').fontSize(9).text('RISQUE / DANGER', 60, y + 6);
      doc.text('SCORE (PxG)', 250, y + 6);
      doc.text('MESURES DE MAÎTRISE', 350, y + 6);

      y += 25;
      if (risks.length === 0) {
        doc.fillColor('#94a3b8').font('Helvetica-Oblique').text("Aucun risque spécifique listé pour ce profil.", 60, y);
      } else {
        risks.forEach(risk => {
          if (y > 700) { doc.addPage(); y = 50; }
          doc.fillColor('#1e293b').font('Helvetica').text(risk.RS_Libelle, 60, y, { width: 180 });
          doc.text(`${risk.RS_Score || 'N/A'}`, 250, y);
          doc.text(risk.RS_Mesures || 'Protection standard & Formation', 350, y, { width: 200 });
          y += 35;
        });
      }

      doc.fontSize(8).fillColor('#94a3b8').text(
        "Document conforme aux exigences ISO 45001 - Généré par Qualisoft Engine.",
        50, 780, { align: 'center' }
      );

      doc.end();
    });
  }
}