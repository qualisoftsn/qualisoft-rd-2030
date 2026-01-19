import { Injectable, NotFoundException } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MeetingsExportService {
  constructor(private prisma: PrismaService) {}

  /**
   * 🏆 GÉNÉRATION DU PV OFFICIEL (PDF)
   * Inclut Présents, Compte-rendu, Actions PAQ et Signature PKI
   */
  async generateMeetingPDF(meetingId: string, tenantId: string): Promise<Buffer> {
    const meeting = await this.prisma.meeting.findUnique({
      where: { MG_Id: meetingId },
      include: {
        tenant: true,
        MG_Processus: true,
        MG_Attendees: { include: { MA_User: true } },
        MG_Actions: { include: { ACT_Responsable: true } },
      }
    });

    if (!meeting || meeting.tenantId !== tenantId) {
      throw new NotFoundException("Instance de gouvernance introuvable.");
    }

    // Récupération de la signature PKI associée
    const signature = await this.prisma.signature.findFirst({
      where: { SIG_EntityId: meetingId, SIG_EntityType: 'MEETING', tenantId },
      orderBy: { SIG_CreatedAt: 'desc' }
    });

    return new Promise((resolve) => {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      // --- EN-TÊTE ---
      doc.fillColor('#1e293b').fontSize(20).text('PROCÈS-VERBAL DE RÉUNION', { underline: true });
      doc.fontSize(10).text(meeting.tenant.T_Name, { align: 'right' });
      doc.moveDown();
      
      doc.fontSize(12).font('Helvetica-Bold').text(`Sujet : ${meeting.MG_Title}`);
      doc.font('Helvetica').text(`Date : ${meeting.MG_Date.toLocaleDateString('fr-FR')}`);
      doc.text(`Processus lié : ${meeting.MG_Processus?.PR_Libelle || 'SMI'}`);
      doc.moveDown(2);

      // --- LISTE DES PRÉSENTS (ÉMARGEMENT) ---
      doc.fontSize(12).font('Helvetica-Bold').text('1. LISTE DES PRÉSENTS');
      doc.moveTo(50, doc.y + 5).lineTo(550, doc.y + 5).stroke();
      doc.moveDown();
      doc.fontSize(10).font('Helvetica');
      const attendees = meeting.MG_Attendees.map(a => `${a.MA_User.U_FirstName} ${a.MA_User.U_LastName}`).join(', ');
      doc.text(attendees || 'Aucun participant enregistré', { align: 'justify' });
      doc.moveDown(2);

      // --- COMPTE-RENDU (PV) ---
      doc.fontSize(12).font('Helvetica-Bold').text('2. COMPTE-RENDU DES ÉCHANGES');
      doc.moveTo(50, doc.y + 5).lineTo(550, doc.y + 5).stroke();
      doc.moveDown();
      doc.fontSize(10).font('Helvetica').text(meeting.MG_Report || 'Aucun compte-rendu saisi.', { align: 'justify' });
      doc.moveDown(2);

      // --- TABLEAU DES ACTIONS DÉCIDÉES ---
      doc.fontSize(12).font('Helvetica-Bold').text('3. DÉCISIONS & ACTIONS (PAQ)');
      doc.moveTo(50, doc.y + 5).lineTo(550, doc.y + 5).stroke();
      doc.moveDown();
      
      let y = doc.y;
      doc.fontSize(9).font('Helvetica-Bold');
      doc.text('Action', 50, y);
      doc.text('Responsable', 300, y);
      doc.text('Échéance', 450, y);
      
      doc.font('Helvetica');
      meeting.MG_Actions.forEach(action => {
        y += 20;
        doc.text(action.ACT_Title.substring(0, 45), 50, y);
        doc.text(action.ACT_Responsable?.U_LastName || '---', 300, y);
        doc.text(action.ACT_Deadline?.toLocaleDateString() || '---', 450, y);
      });

      // --- BLOC DE SIGNATURE PKI ---
      const footerY = 730;
      if (signature) {
        doc.rect(50, footerY, 500, 50).dash(5, { space: 10 }).strokeColor('#2563eb').stroke();
        doc.fillColor('#2563eb').fontSize(8).font('Helvetica-Bold')
           .text('🔒 DOCUMENT SIGNÉ ÉLECTRONIQUEMENT (CONFORMITÉ ISO)', 60, footerY + 10);
        doc.fillColor('#1e293b').font('Helvetica')
           .text(`Hash : ${signature.SIG_Hash} | ID: ${signature.SIG_Id}`, 60, footerY + 25);
      } else {
        doc.fillColor('#ef4444').fontSize(9).text('⚠️ ATTENTION : CE PV N\'EST PAS ENCORE SIGNÉ.', 50, footerY);
      }

      doc.end();
    });
  }
}