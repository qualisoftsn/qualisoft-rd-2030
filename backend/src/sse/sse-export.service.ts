import { Injectable, NotFoundException } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SseExportService {
  constructor(private prisma: PrismaService) {}

  /**
   * 📑 GÉNÉRATION DE LA FICHE D'EXPOSITION (ISO 45001 / MASE)
   * Croise l'unité de travail (OrgUnit) du collaborateur avec les risques (Risk) du DUER
   */
  async generateExpositionPDF(userId: string, tenantId: string): Promise<Buffer> {
    // 1. Récupération du collaborateur avec son unité et les risques rattachés aux processus
    const user = await this.prisma.user.findFirst({
      where: { U_Id: userId, tenantId },
      include: {
        U_OrgUnit: {
          include: {
            OU_Site: true,
            // Dans ton schéma, OrgUnit n'a pas de lien direct PR_Risks, 
            // mais les risques sont liés aux processus PR_Risks.
            // On va chercher les risques via la relation inverse si nécessaire ou via les processus rattachés.
          }
        },
      }
    });

    if (!user) throw new NotFoundException("Collaborateur introuvable.");

    // 2. Extraction des risques liés à l'Unité Organique (DUER)
    // On récupère les risques où le RS_Processus est lié à l'unité organique de l'utilisateur
    const risks = await this.prisma.risk.findMany({
      where: {
        tenantId,
        RS_Processus: {
          PR_PAQ: {
            some: {
              PAQ_Processus: {
                PR_Id: user.U_OrgUnitId || undefined
              }
            }
          }
        }
      },
      include: { RS_Type: true }
    });

    return new Promise((resolve) => {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      // --- EN-TÊTE ---
      doc.fillColor('#1e293b').fontSize(18).font('Helvetica-Bold').text("FICHE INDIVIDUELLE D'EXPOSITION AUX RISQUES", { underline: true });
      doc.moveDown();
      doc.fontSize(10).font('Helvetica').text(`Document généré le : ${new Date().toLocaleDateString('fr-FR')}`, { align: 'right' });
      doc.moveDown(2);

      // --- IDENTIFICATION (Correction des accès aux champs Prisma) ---
      doc.fontSize(12).font('Helvetica-Bold').text(`Collaborateur : ${user.U_FirstName} ${user.U_LastName}`);
      doc.font('Helvetica').text(`Email : ${user.U_Email}`);
      doc.text(`Unité Organique : ${user.U_OrgUnit?.OU_Name || 'Non affectée'}`);
      doc.text(`Site : ${user.U_OrgUnit?.OU_Site?.S_Name || 'Siège'}`);
      doc.moveDown(2);

      // --- TABLEAU DES EXPOSITIONS ---
      doc.fontSize(12).font('Helvetica-Bold').text('ÉVALUATION DES EXPOSITIONS PROFESSIONNELLES');
      doc.moveTo(50, doc.y + 5).lineTo(550, doc.y + 5).stroke();
      doc.moveDown();

      if (risks.length === 0) {
        doc.fontSize(10).font('Helvetica-Oblique').text("Aucun risque spécifique identifié pour cette unité de travail dans le DUER.");
      } else {
        let y = doc.y;
        doc.fontSize(10).font('Helvetica-Bold');
        doc.text('RISQUE IDENTIFIÉ', 50, y);
        doc.text('CRITICITÉ (PxG)', 250, y);
        doc.text('MESURES DE PRÉVENTION', 350, y);

        doc.font('Helvetica').fontSize(9);
        risks.forEach(risk => {
          y += 25;
          // Gestion du saut de page automatique
          if (y > 750) { 
            doc.addPage(); 
            y = 50; 
            doc.fontSize(10).font('Helvetica-Bold');
            doc.text('RISQUE IDENTIFIÉ (suite)', 50, y);
            y += 20;
          }

          doc.font('Helvetica');
          doc.text(risk.RS_Libelle, 50, y, { width: 180 });
          doc.text(`${risk.RS_Probabilite} x ${risk.RS_Gravite} = ${risk.RS_Score}`, 250, y);
          doc.text(risk.RS_Mesures || 'Port des EPI obligatoire', 350, y, { width: 200 });
        });
      }

      // --- PIED DE PAGE ---
      doc.fontSize(8).fillColor('#64748b').text(
        "Ce document est confidentiel et participe à la surveillance médicale renforcée du collaborateur conformément à la réglementation SSE en vigueur.",
        50, 780, { align: 'center' }
      );

      doc.end();
    });
  }
}